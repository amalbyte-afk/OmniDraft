from app.config import settings
from app.services.llm import (
    nvidia_stream_delta,
    nvidia_stream_models,
    nvidia_stream_timeout,
)


def test_nvidia_stream_timeout_limits_slow_primary_responses():
    timeout = nvidia_stream_timeout()

    assert timeout.read == 30


def test_nvidia_stream_models_tries_configured_fallback_after_primary():
    assert nvidia_stream_models() == (
        settings.nvidia_model,
        settings.nvidia_fallback_model,
    )


def test_nvidia_stream_delta_ignores_events_without_choices():
    assert nvidia_stream_delta({"choices": []}) == ""
