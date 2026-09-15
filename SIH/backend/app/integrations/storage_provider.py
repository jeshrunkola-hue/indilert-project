"""Media storage provider interface and Local filesystem implementation."""
from abc import ABC, abstractmethod
import os
import uuid
import aiofiles
from app.core.config import settings

class StorageProvider(ABC):
    @abstractmethod
    async def save_file(self, file_content: bytes, original_filename: str) -> str:
        """Save file bytes and return relative or public URL."""
        pass

class LocalStorageProvider(StorageProvider):
    def __init__(self, upload_dir: str = settings.UPLOAD_DIR):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_file(self, file_content: bytes, original_filename: str) -> str:
        ext = os.path.splitext(original_filename)[1]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(self.upload_dir, unique_name)
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(file_content)
        return f"/uploads/{unique_name}"
