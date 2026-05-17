"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Text, Metric, Grid, BarChart, DonutChart, Title } from "@tremor/react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface AnalyticsData {
  total_docs: number;
  validation_stats: {
    Success: number;
    "Manual Review Required": number;
  };
  shift_distribution: Record<string, number>;
  uploads_over_time: Record<string, number>;
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get<AnalyticsData>(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const shiftData = data?.shift_distribution ? Object.keys(data.shift_distribution).map(k => ({
    name: `Shift ${k}`,
    quantity: data.shift_distribution[k]
  })) : [];

  const validationData = data?.validation_stats ? [
    { name: "Success", value: data.validation_stats["Success"] },
    { name: "Manual Review Required", value: data.validation_stats["Manual Review Required"] }
  ] : [];

  const hasData = (data?.total_docs || 0) > 0;

  return (
    <div className="max-w-6xl mx-auto mt-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enterprise Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time AI Document Extraction Metrics</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" className="shadow-sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </Button>
      </div>

      <Grid numItemsSm={1} numItemsLg={3} className="gap-6">
        <Card className="col-span-1 shadow-sm ring-1 ring-slate-200">
          <Text>Total Documents Processed</Text>
          {loading && !data ? <div className="h-8 mt-2 bg-slate-200 animate-pulse rounded w-16" /> : <Metric>{data?.total_docs || 0}</Metric>}
        </Card>
        <Card className="col-span-1 shadow-sm ring-1 ring-slate-200">
          <Text>Successful Validations</Text>
          {loading && !data ? <div className="h-8 mt-2 bg-slate-200 animate-pulse rounded w-16" /> : <Metric>{data?.validation_stats?.Success || 0}</Metric>}
        </Card>
        <Card className="col-span-1 shadow-sm ring-1 ring-slate-200">
          <Text>Manual Reviews Pending</Text>
          {loading && !data ? <div className="h-8 mt-2 bg-slate-200 animate-pulse rounded w-16" /> : <Metric>{data?.validation_stats?.["Manual Review Required"] || 0}</Metric>}
        </Card>
      </Grid>

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
        <Card className="col-span-1 shadow-sm ring-1 ring-slate-200">
          <Title>Validation Quality</Title>
          <Text>Success vs. Manual Review Required</Text>
          {loading && !data ? (
            <div className="h-52 mt-6 bg-slate-100 animate-pulse rounded flex items-center justify-center text-slate-400">Loading chart...</div>
          ) : hasData ? (
            <DonutChart
              data={validationData}
              category="value"
              index="name"
              colors={["emerald", "rose"]}
              className="mt-6 h-52"
              valueFormatter={(number) => Intl.NumberFormat("us").format(number).toString()}
            />
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-400 mt-6">No data available</div>
          )}
        </Card>
        
        <Card className="col-span-1 shadow-sm ring-1 ring-slate-200">
          <Title>Production by Shift</Title>
          <Text>Total Quantity Produced</Text>
          {loading && !data ? (
            <div className="h-52 mt-6 bg-slate-100 animate-pulse rounded flex items-center justify-center text-slate-400">Loading chart...</div>
          ) : hasData ? (
            <BarChart
              data={shiftData}
              index="name"
              categories={["quantity"]}
              colors={["indigo"]}
              className="mt-6 h-52"
              valueFormatter={(number) => Intl.NumberFormat("us").format(number).toString()}
            />
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-400 mt-6">No data available</div>
          )}
        </Card>
      </Grid>
    </div>
  );
}
