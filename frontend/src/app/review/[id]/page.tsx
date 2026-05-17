"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Save, CheckCircle2, XCircle } from "lucide-react";

interface DocumentItem {
  id: string;
  file_name: string;
  storage_path: string;
  status: string;
  created_at: string;
}

interface RecordItem {
  id: string;
  documents: DocumentItem;
  date: string | null;
  shift: string | null;
  employee_number: string | null;
  operation_code: string | null;
  machine_number: string | null;
  work_order_number: string | null;
  quantity_produced: number | null;
  time_taken: string | null;
  confidence_scores: Record<string, number>;
  is_validated: boolean;
  requires_manual_review: boolean;
  status: string;
  validation_errors: Record<string, string> | null;
}

interface FormDataState {
  date: string;
  shift: string;
  employee_number: string;
  operation_code: string;
  machine_number: string;
  work_order_number: string;
  quantity_produced: string;
  time_taken: string;
}

export default function ReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [record, setRecord] = useState<RecordItem | null>(null);
  const [formData, setFormData] = useState<FormDataState>({
    date: "",
    shift: "",
    employee_number: "",
    operation_code: "",
    machine_number: "",
    work_order_number: "",
    quantity_produced: "",
    time_taken: ""
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await axios.get<RecordItem[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/records`);
        const match = res.data.find((r: RecordItem) => r.id === id);
        if (match) {
          setRecord(match);
          setFormData({
            date: match.date || "",
            shift: match.shift || "",
            employee_number: match.employee_number || "",
            operation_code: match.operation_code || "",
            machine_number: match.machine_number || "",
            work_order_number: match.work_order_number || "",
            quantity_produced: match.quantity_produced !== null ? String(match.quantity_produced) : "",
            time_taken: match.time_taken || "",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecord();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string | number | null> = { ...formData };
      payload.quantity_produced = parseInt(formData.quantity_produced, 10) || 0;
      
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/records/${id}`, payload);
      setToastMessage("Record updated and validated successfully!");
      setToastType("success");
      setTimeout(() => {
        setToastType("");
        router.push("/history");
      }, 2000);
    } catch (e) {
      console.error(e);
      setToastMessage("Failed to save changes. Server or database may be offline.");
      setToastType("error");
      setTimeout(() => {
        setToastType("");
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (!record) return <div className="p-8 text-red-500">Record not found.</div>;

  const docUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${record.documents.id}/file`;
  const errors = record.validation_errors || {};
  const confs = record.confidence_scores || {};

  const fields = [
    { key: "date", label: "Date" },
    { key: "shift", label: "Shift" },
    { key: "employee_number", label: "Employee Number" },
    { key: "operation_code", label: "Operation Code" },
    { key: "machine_number", label: "Machine Number" },
    { key: "work_order_number", label: "Work Order Number" },
    { key: "quantity_produced", label: "Quantity Produced", type: "number" },
    { key: "time_taken", label: "Time Taken" },
  ] as const;

  return (
    <>
      {toastType === "success" && (
        <div className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 z-50">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
      {toastType === "error" && (
        <div className="fixed top-4 right-4 bg-rose-500 text-white px-4 py-3 rounded shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 z-50">
          <XCircle className="w-5 h-5" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-6rem)]">
        {/* Left: Document Preview */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="py-4 border-b shrink-0 bg-slate-50">
            <CardTitle className="text-lg">Original Document</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 bg-slate-200 overflow-auto flex items-center justify-center">
            {record.documents.storage_path.endsWith(".pdf") ? (
              <iframe src={docUrl} className="w-full h-full border-none" />
            ) : (
              <img src={docUrl} alt="Document" className="max-w-full max-h-full object-contain" />
            )}
          </CardContent>
        </Card>

        {/* Right: Editable Form */}
        <Card className="flex flex-col h-full overflow-hidden shadow-md border-indigo-100">
          <CardHeader className="py-4 border-b shrink-0 flex flex-row items-center justify-between bg-slate-50">
            <div>
              <CardTitle className="text-xl text-slate-800">Extraction Review</CardTitle>
              {record.requires_manual_review && (
                <Badge variant="warning" className="mt-2"><AlertTriangle className="w-3 h-3 mr-1" /> Review Required</Badge>
              )}
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save & Submit</>}
            </Button>
          </CardHeader>
          <CardContent className="p-6 overflow-y-auto space-y-5">
            {fields.map((f) => {
              const conf = confs[f.key];
              const hasLowConf = conf !== undefined && conf < 0.7;
              const errorMsg = errors[f.key];
              const hasError = !!errorMsg;
              const formValue = formData[f.key as keyof FormDataState];

              return (
                <div key={f.key} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className={`${hasError ? "text-red-500 font-bold" : "text-slate-700"}`}>
                      {f.label}
                    </Label>
                    {hasLowConf && !hasError && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full uppercase font-bold shadow-sm">
                        Low Confidence ({(conf * 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                  {f.key === "shift" ? (
                    <select
                      value={formValue}
                      onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${hasError ? "border-red-500 focus-visible:ring-red-500 bg-red-50/50" : ""} ${hasLowConf && !hasError ? "border-yellow-400 focus-visible:ring-yellow-400 bg-yellow-50/30" : ""}`}
                    >
                      <option value="">Select Shift</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  ) : (
                    <Input
                      type={f.type || "text"}
                      value={formValue}
                      onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      className={`
                        ${hasError ? "border-red-500 focus-visible:ring-red-500 bg-red-50/50" : ""}
                        ${hasLowConf && !hasError ? "border-yellow-400 focus-visible:ring-yellow-400 bg-yellow-50/30" : ""}
                      `}
                    />
                  )}
                  {hasError && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
