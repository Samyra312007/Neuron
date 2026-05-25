from app.config import settings


def test_settings_defaults():
    assert settings.environment == "development"
    assert settings.mock_ai or not settings.nvidia_nim_api_key


def test_mock_ai_property():
    settings.mock_ai = True
    assert settings.mock_ai_enabled is True
    settings.mock_ai = False
