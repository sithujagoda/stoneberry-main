import os
import io
import numpy as np
from PIL import Image
from fastapi import HTTPException
import logging

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

    def verify_image(self, file_bytes: bytes) -> bool:
        """
        Takes raw image bytes, resizes to 224x224, and runs inference.
        Returns True if it's a gemstone, False if NotGem.
        """
        if self._model is None:
            # If model failed to load or TF is missing, we bypass to avoid blocking the app
            return True

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
            
            logger.info(f"AI Verification - Score: {score:.4f}, Passed: {is_gemstone}")
            return is_gemstone
            
        except Exception as e:
            logger.error(f"Error during AI verification: {e}")
            # Failsafe: if the image processing crashes, we reject to be safe
            raise HTTPException(status_code=400, detail="Invalid image format.")

# Singleton instance for easy import
ai_detector = GemstoneDetector()
