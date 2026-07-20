import logging

from fastapi import APIRouter, UploadFile, File, HTTPException

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upload", tags=["upload"])

MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("")
async def upload_file(file: UploadFile = File(...)):
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail={"detail": "File too large (max 10MB)", "code": "validation_error"},
        )

    try:
        content = await file.read()
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail={"detail": "File must be UTF-8 encoded text", "code": "validation_error"},
        )

    return {"filename": file.filename, "content": text, "size": len(text)}
