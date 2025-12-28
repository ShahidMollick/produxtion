"use client"

import { useState } from "react"
import { useAuditorData, DateRangeType } from "@/hooks/useAuditorData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Package, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { WorkerRankings } from "@/components/dashboard/WorkerRankings"
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts"

export default function AuditorDashboard() {
  const [range, setRange] = useState<DateRangeType>('today')
  const { data, totals, loading } = useAuditorData(range)

  // Auditor Metrics
  const defectRate = totals.produced > 0 ? ((totals.alteration / totals.produced) * 100).toFixed(1) : "0.0"
  const efficiency = totals.issued > 0 ? ((totals.produced / totals.issued) * 100).toFixed(1) : "0.0"

  return (
    <div className="space-y-6 pb-24 pt-safe animate-in fade-in duration-500">
      {/* Header & Range Selector */}
      <div className="flex flex-col gap-4 px-1">
         <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white tracking-tight">Audit Overview</h1>
            <div className="flex bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
               {(['today', 'week', 'month'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all capitalize",
                      range === r ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {r}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* KPI Cards for Auditors */}
      <div className="grid grid-cols-2 gap-3">
         {/* Efficiency Card */}
         <Card className="bg-zinc-900/40 border-zinc-800">
            <CardHeader className="p-4 pb-2">
               <CardTitle className="text-sm font-medium text-zinc-400">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
               <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{efficiency}%</span>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
               </div>
               <p className="text-xs text-zinc-600 mt-1">Issued to Produced</p>
            </CardContent>
         </Card>

           {/* Defect Rate Card */}
         <Card className="bg-zinc-900/40 border-zinc-800">
            <CardHeader className="p-4 pb-2">
               <CardTitle className="text-sm font-medium text-zinc-400">Alteration Rate</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
               <div className="flex items-baseline gap-2">
                  <span className={cn("text-3xl font-bold", Number(defectRate) > 5 ? "text-red-400" : "text-white")}>{defectRate}%</span>
                  <AlertCircle className="h-4 w-4 text-zinc-600" />
               </div>
               <p className="text-xs text-zinc-600 mt-1">Defects per 100 units</p>
            </CardContent>
         </Card>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 gap-3">
         <Card className="bg-gradient-to-br from-indigo-900/20 to-zinc-900/40 border-zinc-800/60">
            <CardContent className="p-5 flex items-center justify-between">
               <div>
                  <p className="text-zinc-400 text-sm font-medium mb-1">Total Production</p>
                  <p className="text-4xl font-bold text-white tracking-tight">{totals.produced.toLocaleString()}</p>
               </div>
               <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Package className="h-6 w-6 text-indigo-400" />
               </div>
            </CardContent>
         </Card>
      </div>
      
      {/* Charts Section */}
      <AnalyticsCharts data={data} range={range} />

      {/* Worker Performance Section */}
      <WorkerRankings data={data} />

      {/* Auditor Note */}
      <div className="text-center text-zinc-600 text-xs px-8">
         Showing aggregated data for the selected period. Values are derived from real-time worker logs.
      </div>
    </div>
  )
}
