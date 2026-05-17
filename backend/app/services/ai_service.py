import os
import json
import google.generativeai as genai
from typing import Dict, Any

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def extract_document_data(file_content: bytes, mime_type: str, repair_prompt: str = None) -> Dict[str, Any]:
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = (
        "You are an industrial data extraction specialist. Extract data from this handwritten manufacturing log. "
        "Return ONLY a valid JSON object. For every field, provide a 'value' and a 'confidence' score between 0 and 1. "
        "If a field is missing, set value to null. "
        "Keys must be exactly: date, shift, employee_number, operation_code, machine_number, work_order_number, quantity_produced, time_taken."
    )
    
    if repair_prompt:
        prompt += f" WARNING: The previous output was invalid JSON. Fix this error: {repair_prompt}"

    result = await model.generate_content_async(
        contents=[
            {"mime_type": mime_type, "data": file_content},
            prompt
        ],
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json"
        )
    )
    
    return json.loads(result.text)
