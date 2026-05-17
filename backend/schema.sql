CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.extracted_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    date TEXT,
    shift TEXT,
    employee_number TEXT,
    operation_code TEXT,
    machine_number TEXT,
    work_order_number TEXT,
    quantity_produced INTEGER,
    time_taken TEXT,
    confidence_scores JSONB,
    is_validated BOOLEAN DEFAULT FALSE,
    requires_manual_review BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'processing',
    raw_llm_response JSONB,
    validation_errors JSONB
);
