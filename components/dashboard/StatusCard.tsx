import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatusCardProps {
  title: string
  value: number
  total?: number
  icon: any
  className?: string
  trend?: string
}

export function StatusCard({ title, value, total, icon: Icon, className, trend }: StatusCardProps) {
  const percentage = total ? Math.min(100, (value / total) * 100) : 0

  return (
    <Card className={cn(
      "overflow-hidden border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-white transition-all hover:bg-zinc-900", 
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
        <div className="p-2 bg-white/5 rounded-full">
          <Icon className="h-4 w-4 text-indigo-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        
        {total !== undefined && (
          <div className="mt-4 space-y-2">
             <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${percentage}%` }}
                />
             </div>
             <p className="text-xs text-zinc-500 flex justify-between">
               <span>Progress</span>
               <span>{percentage.toFixed(0)}%</span>
             </p>
          </div>
        )}
        
        {!total && trend && (
           <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
             ▲ {trend} <span className="text-zinc-500">vs yesterday</span>
           </p>
        )}
      </CardContent>
    </Card>
  )
}
