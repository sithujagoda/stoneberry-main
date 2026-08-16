from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from backend.app.services.ai_service import GemstoneDetector

@patch("backend.app.services.ai_service.Image")
def test_verify_image_gemstone(mock_image):
    detector = GemstoneDetector()
    detector._model = MagicMock()
    
    mock_img_instance = MagicMock()
    mock_image.open.return_value.convert.return_value = mock_img_instance
    mock_img_instance.resize.return_value = mock_img_instance
    
    # Simulate prediction score < 0.5
    detector._model.predict.return_value = [[0.1]]

    result = detector.verify_image(b"fake_bytes")
    
    assert result is True

@patch("backend.app.services.ai_service.Image")
def test_verify_image_not_gemstone(mock_image):
    detector = GemstoneDetector()
    detector._model = MagicMock()
    
    mock_img_instance = MagicMock()
    mock_image.open.return_value.convert.return_value = mock_img_instance
    mock_img_instance.resize.return_value = mock_img_instance
    
    # Simulate prediction score > 0.5
    detector._model.predict.return_value = [[0.9]]

    result = detector.verify_image(b"fake_bytes")
    
    assert result is False

def test_verify_image_no_model():
    detector = GemstoneDetector()
    detector._model = None

    result = detector.verify_image(b"fake_bytes")
    
    # Should bypass and return True
    assert result is True

@patch("backend.app.services.ai_service.Image")
def test_verify_image_exception(mock_image):
    detector = GemstoneDetector()
    detector._model = MagicMock()
    
    mock_image.open.side_effect = Exception("Invalid image")

    try:
        detector.verify_image(b"fake_bytes")
        assert False
    except HTTPException as e:
        assert e.status_code == 400
        assert e.detail == "Invalid image format."
