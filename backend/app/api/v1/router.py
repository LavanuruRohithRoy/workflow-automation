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
        
        supabase.storage.from_("document-uploads").upload(storage_path, file_content)
        
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
    # Left join by selecting documents and extracted_records
    query = supabase.table("documents").select("*, extracted_records(*)")
    
    if status:
        query = query.eq("status", status)
        
    response = query.execute()
    records = response.data
    
    result = []
    for doc in records:
        ext_records = doc.get("extracted_records", [])
        if ext_records:
            ext = ext_records[0]
            if shift and ext.get("shift") != shift: continue
            if machine_number and ext.get("machine_number") != machine_number: continue
            ext["documents"] = {k: v for k, v in doc.items() if k != "extracted_records"}
            result.append(ext)
        else:
            result.append({
                "id": f"ghost-{doc['id']}",
                "documents": {k: v for k, v in doc.items() if k != "extracted_records"},
                "shift": "-",
                "machine_number": "-",
                "requires_manual_review": False,
                "confidence_scores": {},
                "validation_errors": {}
            })
    return result

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

from fastapi.responses import Response

@router.get("/documents/{doc_id}/file")
def get_document_file(doc_id: str):
    supabase = get_supabase_client()
    doc_res = supabase.table("documents").select("storage_path").eq("id", doc_id).execute()
    if not doc_res.data:
        raise HTTPException(status_code=404, detail="Document not found")
        
    storage_path = doc_res.data[0]["storage_path"]
    file_bytes = supabase.storage.from_("document-uploads").download(storage_path)
    
    mime_type = "application/pdf" if storage_path.lower().endswith(".pdf") else "image/jpeg"
    return Response(content=file_bytes, media_type=mime_type)

@router.get("/analytics")
def get_analytics():
    supabase = get_supabase_client()
    docs_res = supabase.table("documents").select("id, created_at").execute()
    docs = docs_res.data or []
    total_docs = len(docs)
    
    uploads_over_time = {}
    for d in docs:
        date = d.get("created_at", "")[:10]
        if date:
            uploads_over_time[date] = uploads_over_time.get(date, 0) + 1
            
    records_res = supabase.table("extracted_records").select("requires_manual_review, shift, machine_number, quantity_produced").execute()
    records = records_res.data or []
    
    failed_count = sum(1 for r in records if r.get("requires_manual_review"))
    success_count = len(records) - failed_count
    
    shift_distribution = {}
    
    for r in records:
        shift = r.get("shift")
        if shift:
            shift_distribution[shift] = shift_distribution.get(shift, 0) + (r.get("quantity_produced") or 0)
            
    return {
        "total_docs": total_docs,
        "validation_stats": {
            "Success": success_count,
            "Manual Review Required": failed_count
        },
        "shift_distribution": shift_distribution if records else {},
        "uploads_over_time": uploads_over_time if docs else {}
    }

