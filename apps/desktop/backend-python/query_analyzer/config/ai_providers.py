"""Encrypted local storage for AI provider profiles."""

import json
from pathlib import Path
from uuid import uuid4

from backend.core.config import settings
from backend.core.encryption import decrypt_password, encrypt_password

PRESETS = {
    "openai": ("OpenAI", "https://api.openai.com/v1", "gpt-4o-mini", "openai"),
    "anthropic": ("Anthropic", "https://api.anthropic.com/v1", "claude-3-5-sonnet-latest", "anthropic"),
    "gemini": ("Google Gemini", "https://generativelanguage.googleapis.com/v1beta", "gemini-2.0-flash", "gemini"),
    "groq": ("Groq", "https://api.groq.com/openai/v1", "llama-3.3-70b-versatile", "openai"),
    "deepseek": ("DeepSeek", "https://api.deepseek.com/v1", "deepseek-chat", "openai"),
    "openrouter": ("OpenRouter", "https://openrouter.ai/api/v1", "openai/gpt-4o-mini", "openai"),
    "mistral": ("Mistral", "https://api.mistral.ai/v1", "mistral-small-latest", "openai"),
    "xai": ("xAI", "https://api.x.ai/v1", "grok-3-mini", "openai"),
    "ollama": ("Ollama", "http://127.0.0.1:11434/v1", "llama3.2", "openai"),
    "lmstudio": ("LM Studio", "http://127.0.0.1:1234/v1", "local-model", "openai"),
    "custom": ("Compatible con OpenAI", "", "", "openai"),
}


class AIProviderStore:
    def __init__(self):
        self.path = Path(settings.APP_CONFIG_DIR) / "ai-providers.enc.json"
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def _load(self):
        if not self.path.exists():
            return []
        return json.loads(self.path.read_text(encoding="utf-8"))

    def _save(self, providers):
        self.path.write_text(json.dumps(providers, indent=2), encoding="utf-8")

    @staticmethod
    def public(provider):
        return {
            **{key: value for key, value in provider.items() if key != "api_key"},
            "has_api_key": bool(provider.get("api_key")),
        }

    def list(self):
        return [self.public(item) for item in self._load()]

    def get(self, provider_id):
        provider = next((item for item in self._load() if item["id"] == provider_id), None)
        if provider and provider.get("api_key"):
            provider["api_key"] = decrypt_password(provider["api_key"])
        return provider

    def create(self, data):
        providers = self._load()
        preset = PRESETS.get(data.get("provider"), PRESETS["custom"])
        provider = {
            "id": str(uuid4()),
            "name": data.get("name") or preset[0],
            "provider": data.get("provider") or "custom",
            "protocol": data.get("protocol") or preset[3],
            "base_url": data.get("base_url") or preset[1],
            "model": data.get("model") or preset[2],
            "api_key": encrypt_password(data["api_key"]) if data.get("api_key") else "",
        }
        providers.append(provider)
        self._save(providers)
        return self.public(provider)

    def update(self, provider_id, data):
        providers = self._load()
        provider = next((item for item in providers if item["id"] == provider_id), None)
        if not provider:
            return None
        for key in ("name", "provider", "protocol", "base_url", "model"):
            if data.get(key) is not None:
                provider[key] = data[key]
        if data.get("api_key"):
            provider["api_key"] = encrypt_password(data["api_key"])
        self._save(providers)
        return self.public(provider)

    def delete(self, provider_id):
        providers = self._load()
        filtered = [item for item in providers if item["id"] != provider_id]
        if len(filtered) == len(providers):
            return False
        self._save(filtered)
        return True
