"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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

export default function HistoryPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get<RecordItem[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/records`);
        setRecords(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filtered = records.filter(r => statusFilter ? r.documents.status === statusFilter : true);

  return (
    <div className="max-w-6xl mx-auto mt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Extraction History</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Filter by status..." 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-900">Filename</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Date Uploaded</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Shift</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((r, index, arr) => {
                    const isNewDoc = index === 0 || r.documents.id !== arr[index - 1].documents.id;
                    return (
                      <tr key={r.id} className={`hover:bg-slate-50/50 ${isNewDoc && index !== 0 ? 'border-t-2 border-slate-200' : ''}`}>
                        <td className="px-4 py-3 font-medium">
                          {isNewDoc ? r.documents.file_name : <span className="text-slate-300 ml-4 font-normal">↳</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {isNewDoc ? format(new Date(r.documents.created_at), "MMM d, yyyy HH:mm") : ''}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{r.shift || '-'}</td>
                        <td className="px-4 py-3">
                          {r.requires_manual_review ? (
                            <Badge variant="warning">Review Required</Badge>
                          ) : r.documents.status === 'processing' ? (
                            <Badge variant="secondary">Processing</Badge>
                          ) : r.documents.status === 'failed' ? (
                            <Badge variant="destructive">Failed</Badge>
                          ) : (
                            <Badge variant="success">Completed</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/review/${r.id}`}>
                            <Button variant="outline" size="sm" disabled={r.documents.status === 'processing'}>
                              {r.requires_manual_review ? 'Review' : r.documents.status === 'processing' ? 'Processing...' : 'View'}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-500">No records found.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
