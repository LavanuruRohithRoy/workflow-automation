import os
import json
from google import genai
from google.genai import types
from typing import Dict, Any

async def extract_document_data(file_content: bytes, mime_type: str, repair_prompt: str = None) -> Dict[str, Any]:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    
    prompt = (
        "You are an industrial data extraction specialist. Extract data from this handwritten manufacturing log. "
        "Return ONLY a valid JSON array of objects (even if there is only one record). For every field, provide a 'value' and a 'confidence' score between 0 and 1. "
        "If a field is missing, set value to null. "
        "Keys must be exactly: date, shift, employee_number, operation_code, machine_number, work_order_number, quantity_produced, time_taken."
    )
    
    if repair_prompt:
        prompt += f" WARNING: The previous output was invalid JSON. Fix this error: {repair_prompt}"

    response = await client.aio.models.generate_content(
        model='gemini-2.5-flash',
        contents=[
            types.Part.from_bytes(data=file_content, mime_type=mime_type),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    response_text = response.text
    
    if response_text.startswith("```json"):
        response_text = response_text.replace("```json", "").replace("```", "").strip()
    elif response_text.startswith("```"):
        response_text = response_text.replace("```", "").strip()
        
    return json.loads(response_text)
