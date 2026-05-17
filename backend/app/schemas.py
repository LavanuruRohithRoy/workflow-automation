from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class ExtractionSchema(BaseModel):
    date: Optional[str] = None
    shift: Optional[str] = None
    employee_number: Optional[str] = None
    operation_code: Optional[str] = None
    machine_number: Optional[str] = None
    work_order_number: Optional[str] = None
    quantity_produced: Optional[int] = None
    time_taken: Optional[str] = None

class DocumentBase(BaseModel):
    file_name: str
    storage_path: str

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: UUID
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class RecordUpdate(BaseModel):
    date: Optional[str] = None
    shift: Optional[str] = None
    employee_number: Optional[str] = None
    operation_code: Optional[str] = None
    machine_number: Optional[str] = None
    work_order_number: Optional[str] = None
    quantity_produced: Optional[int] = None
    time_taken: Optional[str] = None
    is_validated: Optional[bool] = None
