import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Worker, DailyProduction } from "@/types"

export function TopPerformers({ workers, production }: { workers: Worker[], production: DailyProduction[] }) {
  // Merge and sort
  const data = workers.map(w => {
    const prod = production.find(p => p.worker_id === w.id)
    return {
      name: w.name,
      produced: prod?.goods_produced || 0,
    }
  }).sort((a, b) => b.produced - a.produced).slice(0, 5)

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 text-white">
      <CardHeader>
        <CardTitle className="text-lg">Top Performers</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-xs text-bold">
                {item.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">{item.name}</p>
              <p className="text-xs text-zinc-500">Rank #{i + 1}</p>
            </div>
            <div className="ml-auto font-bold text-indigo-400">
               {item.produced} <span className="text-xs text-zinc-600 font-normal">pcs</span>
            </div>
          </div>
        ))}
         {data.length === 0 && <p className="text-sm text-zinc-500">No data available.</p>}
      </CardContent>
    </Card>
  )
}
