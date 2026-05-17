from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Query
from app.database import get_supabase_client
from app.logic.processor import process_document_workflow, validate_record_data
from app.schemas import RecordUpdate
from uuid import uuid4

router = APIRouter()

@router.post("/upload")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    supabase = get_supabase_client()
    try:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
        file_id = str(uuid4())
        storage_path = f"{file_id}.{file_ext}"
        
        file_content = await file.read()
        
        supabase.storage.from_("documents").upload(storage_path, file_content)
        
        supabase.table("documents").insert({
            "id": file_id,
            "file_name": file.filename,
            "storage_path": storage_path,
            "status": "processing"
        }).execute()
        
        background_tasks.add_task(process_document_workflow, file_id, storage_path)
        
        return {"message": "Document uploaded successfully", "document_id": file_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/records")
def get_records(
    status: str = Query(None),
    shift: str = Query(None),
    machine_number: str = Query(None)
):
    supabase = get_supabase_client()
    query = supabase.table("extracted_records").select("*, documents!inner(*)")
    
    if status:
        query = query.eq("documents.status", status)
    if shift:
        query = query.eq("shift", shift)
    if machine_number:
        query = query.eq("machine_number", machine_number)
        
    response = query.execute()
    return response.data

@router.patch("/records/{record_id}")
def update_record(record_id: str, payload: RecordUpdate):
    supabase = get_supabase_client()
    update_data = payload.model_dump(exclude_unset=True)
    
    errors = validate_record_data(update_data)
    
    if errors:
        update_data["validation_errors"] = errors
        update_data["requires_manual_review"] = True
        update_data["is_validated"] = False
    else:
        update_data["validation_errors"] = None
        update_data["requires_manual_review"] = False
        update_data["is_validated"] = True
        
    response = supabase.table("extracted_records").update(update_data).eq("id", record_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Record not found")
        
    return response.data[0]
