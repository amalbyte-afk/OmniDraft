from pydantic import BaseModel
from typing import Literal


class ExportRequest(BaseModel):
    format: Literal["txt", "md", "pdf"] = "txt"
