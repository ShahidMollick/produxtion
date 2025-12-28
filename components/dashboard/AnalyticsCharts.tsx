"use client"

import { useMemo } from "react"
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  PieChart, 
  Pie 
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DailyProduction } from "@/types"
import { DateRangeType } from "@/hooks/useAuditorData"
import { format, parseISO } from "date-fns"

interface AnalyticsChartsProps {
  data: DailyProduction[]
  range: DateRangeType
}

export function AnalyticsCharts({ data, range }: AnalyticsChartsProps) {
  
  // 1. Trend Data (Grouping by Date)
  const trendData = useMemo(() => {
    if (range === 'today') return []
    
    // Group by date
    const grouped = data.reduce((acc, curr) => {
      const date = curr.date
      if (!acc[date]) acc[date] = { date, produced: 0, issued: 0 }
      acc[date].produced += (curr.goods_produced || 0)
      acc[date].issued += (curr.goods_issued || 0)
      return acc
    }, {} as Record<string, { date: string, produced: number, issued: number }>)
    
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        label: format(parseISO(item.date), "MMM d")
      }))
  }, [data, range])

  // 2. Worker Contribution (For 'Today' view or generic top list)
  const workerData = useMemo(() => {
    const stats = data.reduce((acc, curr) => {
      const name = curr.worker?.name || 'Unknown'
      if (!acc[name]) acc[name] = { name, value: 0 }
      acc[name].value += (curr.goods_produced || 0)
      return acc
    }, {} as Record<string, { name: string, value: number }>)
    
    return Object.values(stats)
      .sort((a, b) => b.value - a.value)
      .slice(0, 7) // Top 7
  }, [data])

  // 3. Status Distribution (Donut)
  const statusData = useMemo(() => {
    const issued = data.reduce((acc, curr) => acc + (curr.goods_issued || 0), 0)
    const produced = data.reduce((acc, curr) => acc + (curr.goods_produced || 0), 0)
    const inHand = data.reduce((acc, curr) => acc + (curr.goods_in_hand || 0), 0)
    // const packed = data.reduce((acc, curr) => acc + (curr.packing_completed || 0), 0)
    
    // Logic: 'Issued' is total input. The flow is: Issued -> In Hand -> Produced.
    // Actually, 'In Hand' + 'Produced' should roughly equal 'Issued' (minus defects).
    // Let's visualize the current STATE of goods.
    // "Pending (In Hand)" vs "Completed (Produced)"
    
    return [
      { name: "In Hand", value: inHand, color: "#6366f1" }, // Indigo
      { name: "Produced", value: produced, color: "#10b981" }, // Emerald
      { name: "Alteration", value: data.reduce((acc, c) => acc + (c.alteration_count || 0), 0), color: "#f87171" } // Red
    ].filter(i => i.value > 0)
  }, [data])

  if (data.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
       {/* Primary Chart: Trend (Week/Month) OR Worker (Today) */}
       <Card className="bg-zinc-900/40 border-zinc-800 col-span-1 lg:col-span-1">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
               {range === 'today' ? "Shift Leaders" : "Production Trend"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] w-full p-2">
            <ResponsiveContainer width="100%" height="100%">
               {range === 'today' ? (
                  <BarChart data={workerData} layout="vertical" margin={{ left: 0, right: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#27272a" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" width={80} tick={{fill: '#a1a1aa', fontSize: 10}} tickLine={false} axisLine={false} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} 
                        itemStyle={{ color: '#fff' }}
                        cursor={{fill: '#27272a'}}
                     />
                     <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16}>
                        {workerData.map((entry, index) => (
                           <Cell key={index} fill={index === 0 ? '#818cf8' : '#4f46e5'} />
                        ))}
                     </Bar>
                  </BarChart>
               ) : (
                  <AreaChart data={trendData}>
                     <defs>
                        <linearGradient id="colorProduced" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                     <XAxis dataKey="label" tick={{fill: '#71717a', fontSize: 10}} tickLine={false} axisLine={false} minTickGap={30} />
                     <YAxis tick={{fill: '#71717a', fontSize: 10}} tickLine={false} axisLine={false} />
                     <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
                     <Area type="monotone" dataKey="produced" stroke="#10b981" fillOpacity={1} fill="url(#colorProduced)" strokeWidth={2} />
                  </AreaChart>
               )}
            </ResponsiveContainer>
          </CardContent>
       </Card>

       {/* Secondary Chart: Distribution */}
       <Card className="bg-zinc-900/40 border-zinc-800 col-span-1 lg:col-span-1">
          <CardHeader className="p-4 pb-2">
             <CardTitle className="text-sm font-medium text-zinc-400">Current Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] w-full p-2 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={statusData}
                   cx="50%"
                   cy="50%"
                   innerRadius={50}
                   outerRadius={70}
                   paddingAngle={5}
                   dataKey="value"
                   stroke="none"
                 >
                   {statusData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
               </PieChart>
             </ResponsiveContainer>
          </CardContent>
       </Card>
    </div>
  )
}
