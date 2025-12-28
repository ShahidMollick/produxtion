import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DailyProduction } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function WorkerRankings({ data }: { data: DailyProduction[] }) {
  // Aggregate production by worker for the given range
  const workerStats = data.reduce((acc, curr) => {
    // If worker relation isn't populated properly by some chance, skip or handle
    const name = curr.worker?.name || 'Unknown'
    const id = curr.worker_id
    
    if (!acc[id]) {
      acc[id] = { name, produced: 0, defects: 0 }
    }
    
    acc[id].produced += (curr.goods_produced || 0)
    acc[id].defects += (curr.alteration_count || 0)
    return acc
  }, {} as Record<string, { name: string, produced: number, defects: number }>)

  // Convert to array and sort
  const sortedWorkers = Object.values(workerStats)
    .sort((a, b) => b.produced - a.produced)
    .slice(0, 5) // Top 5

  return (
    <Card className="bg-zinc-900/30 border-zinc-800">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">Top Performers</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-zinc-800/50">
          {sortedWorkers.map((w, i) => (
            <li key={w.name} className="flex items-center justify-between p-4 hover:bg-zinc-800/20 transition-colors">
               <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-600 font-bold w-4">{i + 1}</span>
                  <Avatar className="h-8 w-8 border border-zinc-700 bg-zinc-800">
                     <AvatarFallback className="text-[10px] bg-transparent text-white">
                        {w.name.substring(0,2).toUpperCase()}
                     </AvatarFallback>
                  </Avatar>
                  <div>
                     <p className="text-sm font-medium text-white">{w.name}</p>
                     <p className="text-[10px] text-zinc-500">{w.defects} defects</p>
                  </div>
               </div>
               
               <div className="text-right">
                  <p className="text-sm font-bold text-indigo-400">{w.produced}</p>
                  <p className="text-[10px] text-zinc-600 uppercase">Pcs</p>
               </div>
            </li>
          ))}
          
          {sortedWorkers.length === 0 && (
             <div className="p-4 text-center text-sm text-zinc-600">No data available</div>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}
