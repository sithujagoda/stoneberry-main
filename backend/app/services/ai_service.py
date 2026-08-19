import os
import io
import base64
import numpy as np
from PIL import Image
from fastapi import HTTPException
import logging

try:
    import cv2
except ImportError:
    cv2 = None

logger = logging.getLogger(__name__)

# To avoid full tensorflow overhead if only using it for inference,
# we import tensorflow and disable CUDA warnings if running on CPU.
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
try:
    import tensorflow as tf
except ImportError:
    tf = None

class GemstoneDetector:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GemstoneDetector, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        if tf is None:
            logger.warning("TensorFlow is not installed. AI verification is disabled.")
            return

        model_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "ai_models", "gemstone_detector_final.keras"
        )

        
        try:
            self._model = tf.keras.models.load_model(model_path)
            logger.info("AI Gemstone Detector model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load AI model: {e}")
            self._model = None

    def verify_image(self, file_bytes: bytes) -> dict:
        """
        Takes raw image bytes, resizes to 224x224, and runs inference.
        Returns dict with is_gemstone, confidence, explanation, and heatmap_base64.
        """
        if self._model is None:
            # If model failed to load or TF is missing, we bypass to avoid blocking the app
            return {
                "is_gemstone": True,
                "confidence": 100.0,
                "explanation": "AI verification skipped (model offline).",
                "heatmap_base64": None
            }

        try:
            # 1. Load image using Pillow
            image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            
            # 2. Resize to 224x224 (required by our model)
            image = image.resize((224, 224))
            
            # 3. Convert to numpy array and normalize
            img_array = np.array(image, dtype=np.float32)
            
            # Our model likely expects normalized values (0-1) or standard preprocessing.
            # We assume [0, 1] normalization here which is standard for Keras.
            # UPDATE: The Keras model has a `tf.keras.layers.Rescaling(1.0 / 255)` layer built-in.
            # Passing raw [0, 255] values is required. We should NOT manually divide by 255.0.
            
            # Add batch dimension: (1, 224, 224, 3)
            img_batch = np.expand_dims(img_array, axis=0)
            
            # 4. Predict
            prediction = self._model.predict(img_batch, verbose=0)
            
            # Assuming binary classification where Output neuron (sigmoid) 
            # > 0.5 means Gemstone and < 0.5 means NotGem, or vice-versa.
            # Let's assume prediction[0][0] > 0.5 means Gemstone.
            score = float(prediction[0][0])
            
            # Keras assigns classes alphabetically:
            # Class 0 = "Gemstone" (score near 0.0)
            # Class 1 = "NotGem"   (score near 1.0)
            # So score < 0.5 means it IS a gemstone.
            is_gemstone = score < 0.5
            confidence = (1.0 - score) * 100.0 if is_gemstone else score * 100.0
            
            explanation = "The AI focused mainly on the gemstone's colour, shape and surface characteristics."
            if not is_gemstone:
                explanation = "The AI focused on background textures and non-gemstone characteristics, suggesting this is not a gemstone."
                
            heatmap_b64 = None
            if tf is not None and cv2 is not None:
                heatmap_b64 = self._generate_heatmap_b64(img_batch, image, is_gemstone)
            
            logger.info(f"AI Verification - Score: {score:.4f}, Passed: {is_gemstone}")
            return {
                "is_gemstone": is_gemstone,
                "confidence": confidence,
                "explanation": explanation,
                "heatmap_base64": heatmap_b64
            }
            
        except Exception as e:
            logger.error(f"Error during AI verification: {e}")
            # Failsafe: if the image processing crashes, we reject to be safe
            raise HTTPException(status_code=400, detail="Invalid image format.")

    def _find_effnet_and_last_conv(self):
        """
        Finds the nested EfficientNet sub-model and the name of the
        last Conv2D layer inside it. Returns (effnet_layer, conv_layer_name)
        or (None, None) if not found.
        """
        effnet = None
        for layer in self._model.layers:
            if 'efficientnet' in layer.name.lower():
                effnet = layer
                break
        if effnet is None:
            return None, None

        # Walk the sub-model's layers in reverse to find the last real Conv2D
        last_conv_name = None
        for layer in reversed(effnet.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv_name = layer.name
                break
        return effnet, last_conv_name

    def _generate_heatmap_b64(self, img_batch, original_image, is_gemstone):
        try:
            effnet, last_conv_name = self._find_effnet_and_last_conv()
            if effnet is None or last_conv_name is None:
                logger.warning("Could not locate EfficientNet sub-model or its last Conv2D layer.")
                return None

            # Build a mini grad-model from the EfficientNet sub-model that
            # exposes both the last conv layer output AND the final feature map.
            effnet_grad_model = tf.keras.Model(
                inputs=effnet.input,
                outputs=[effnet.get_layer(last_conv_name).output, effnet.output]
            )

            # --- Manual forward pass through the outer model ---
            with tf.GradientTape() as tape:
                # 1. Pass through layers BEFORE the EfficientNet (e.g. data_augmentation)
                x = img_batch
                for layer in self._model.layers:
                    if isinstance(layer, tf.keras.layers.InputLayer):
                        continue
                    if layer.name == effnet.name:
                        break  # stop right before EfficientNet
                    x = layer(x)

                # 2. Pass through the EfficientNet grad-model
                conv_output, effnet_out = effnet_grad_model(x)
                tape.watch(conv_output)

                # 3. Pass through layers AFTER the EfficientNet (GAP, BN, Dense, etc.)
                y = effnet_out
                past_effnet = False
                for layer in self._model.layers:
                    if layer.name == effnet.name:
                        past_effnet = True
                        continue
                    if not past_effnet or isinstance(layer, tf.keras.layers.InputLayer):
                        continue
                    y = layer(y)

                # y is the final prediction (shape: [batch, 1])
                if is_gemstone:
                    class_channel = 1.0 - y[:, 0]
                else:
                    class_channel = y[:, 0]

            grads = tape.gradient(class_channel, conv_output)
            if grads is None:
                logger.warning("GradientTape returned None gradients.")
                return None

            pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

            conv_output = conv_output[0]
            heatmap = conv_output @ pooled_grads[..., tf.newaxis]
            heatmap = tf.squeeze(heatmap)

            # Normalize heatmap to [0, 1]
            heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
            heatmap = heatmap.numpy()

            if np.isnan(heatmap).any() or np.max(heatmap) == 0:
                return None

            # Overlay heatmap on original image
            heatmap_uint8 = np.uint8(255 * heatmap)
            jet = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
            jet = cv2.cvtColor(jet, cv2.COLOR_BGR2RGB)

            original_np = np.array(original_image)
            jet = cv2.resize(jet, (original_np.shape[1], original_np.shape[0]))

            superimposed_img = cv2.addWeighted(original_np, 0.6, jet, 0.4, 0)

            img_pil = Image.fromarray(superimposed_img)
            buffered = io.BytesIO()
            img_pil.save(buffered, format="JPEG", quality=85)
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            return f"data:image/jpeg;base64,{img_str}"
        except Exception as e:
            logger.error(f"Failed to generate heatmap: {e}", exc_info=True)
            return None

# Singleton instance for easy import
ai_detector = GemstoneDetector()
