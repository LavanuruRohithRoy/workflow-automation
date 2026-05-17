import json
import logging
from app.database import get_supabase_client
from app.services.ai_service import extract_document_data
from app.schemas import ExtractionSchema

def validate_record_data(data: dict) -> dict:
    errors = {}
    shift = data.get("shift")
    if shift is not None and str(shift) not in ['1', '2', '3']:
        errors["shift"] = "Shift must be '1', '2', or '3'"
    
    qty = data.get("quantity_produced")
    if qty is not None:
        try:
            if int(qty) <= 0:
                errors["quantity_produced"] = "Quantity must be a positive integer"
        except ValueError:
            errors["quantity_produced"] = "Quantity must be a valid integer"
            
    wo = data.get("work_order_number")
    if wo is not None and (not isinstance(wo, str) or not str(wo).strip()):
        errors["work_order_number"] = "Work Order must be a non-empty string"
        
    return errors

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def process_document_workflow(doc_id: str, file_path: str):
    logger.info(f"Starting process_document_workflow for doc_id: {doc_id}")
    supabase = get_supabase_client()
    try:
        file_response = supabase.storage.from_("document-uploads").download(file_path)
        mime_type = "application/pdf" if file_path.lower().endswith(".pdf") else "image/jpeg"
        logger.info(f"Downloaded file {file_path}, mime_type: {mime_type}")
        
        try:
            raw_data = await extract_document_data(file_response, mime_type)
            logger.info("Successfully extracted data on first attempt.")
        except (json.JSONDecodeError, Exception) as e:
            logger.warning(f"First extraction attempt failed: {e}. Attempting repair.")
            try:
                raw_data = await extract_document_data(file_response, mime_type, repair_prompt=str(e))
                logger.info("Successfully extracted data on repair attempt.")
            except Exception as e2:
                logger.error(f"Repair extraction also failed: {e2}")
                supabase.table("documents").update({"status": "failed"}).eq("id", doc_id).execute()
                return

        if not isinstance(raw_data, list):
            raw_data = [raw_data]
            
        records_to_insert = []
        for record_data in raw_data:
            values = {}
            confidences = {}
            
            expected_keys = [
                "date", "shift", "employee_number", "operation_code", 
                "machine_number", "work_order_number", "quantity_produced", "time_taken"
            ]
            
            for key in expected_keys:
                field_data = record_data.get(key, {})
                if isinstance(field_data, dict):
                    val = field_data.get("value")
                    conf = field_data.get("confidence", 0.0)
                    values[key] = val
                    confidences[key] = float(conf) if conf is not None else 0.0
                else:
                    values[key] = field_data
                    confidences[key] = 0.0
                    
            shift_val = values.get("shift")
            if shift_val:
                shift_str = str(shift_val).upper().strip()
                if shift_str == "I": values["shift"] = "1"
                elif shift_str == "II": values["shift"] = "2"
                elif shift_str == "III": values["shift"] = "3"
                
            qty = values.get("quantity_produced")
            if qty not in [None, ""]:
                try:
                    values["quantity_produced"] = int(qty)
                except (ValueError, TypeError):
                    values["quantity_produced"] = None
            else:
                values["quantity_produced"] = None
                
            try:
                validated_data = ExtractionSchema(**values)
            except Exception as e:
                logger.error(f"Pydantic Validation failed: {e}")
                validated_data = ExtractionSchema.model_construct(**values)
            
            valid_confidences = [c for c in confidences.values() if c is not None]
            avg_confidence = sum(valid_confidences) / len(valid_confidences) if valid_confidences else 0.0
            wo_conf = confidences.get("work_order_number", 0.0)
            qty_conf = confidences.get("quantity_produced", 0.0)
            
            requires_manual_review = False
            record_status = 'completed'
            validation_errors = None
            
            errors = validate_record_data(values)
            
            if avg_confidence < 0.7 or wo_conf < 0.5 or qty_conf < 0.5 or errors:
                requires_manual_review = True
                record_status = 'processing'
                if errors:
                    validation_errors = errors
                
            records_to_insert.append({
                "document_id": doc_id,
                "date": validated_data.date,
                "shift": validated_data.shift,
                "employee_number": validated_data.employee_number,
                "operation_code": validated_data.operation_code,
                "machine_number": validated_data.machine_number,
                "work_order_number": validated_data.work_order_number,
                "quantity_produced": validated_data.quantity_produced,
                "time_taken": validated_data.time_taken,
                "confidence_scores": confidences,
                "is_validated": not requires_manual_review,
                "requires_manual_review": requires_manual_review,
                "status": record_status,
                "validation_errors": validation_errors,
                "raw_llm_response": record_data
            })
            
        if records_to_insert:
            supabase.table("extracted_records").insert(records_to_insert).execute()
        
        supabase.table("documents").update({"status": "completed"}).eq("id", doc_id).execute()
        logger.info(f"Successfully saved extracted_records for doc_id: {doc_id}")
        print(f"SUCCESS: Saved record for {file_path}")
        
    except Exception as e:
        logger.error(f"process_document_workflow crashed: {e}")
        supabase.table("documents").update({"status": "failed"}).eq("id", doc_id).execute()
