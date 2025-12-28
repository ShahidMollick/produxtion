"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import { Worker, DailyProduction } from "@/types"
import { HandoverControls } from "./HandoverControls"
import { updateProductionCount, initializeProduction } from "@/lib/supabase/queries"
import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // Assuming Button is available

interface WorkerListProps {
  workers: Worker[]
  production: DailyProduction[]
  date: string
  refetch: () => void
}

export function WorkerList({ workers, production, date, refetch }: WorkerListProps) {
  const [search, setSearch] = useState("")
  // Track expanded state for each worker to keep list compact
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleUpdate = async (workerId: string, currentProd: DailyProduction | undefined, type: string, qty: number) => {
    try {
      let prod = currentProd
      if (!prod) {
        prod = await initializeProduction(workerId, date)
      }
      const id = prod!.id
      
      switch (type) {
        case 'issue':
          await updateProductionCount(id, 'goods_issued', (prod?.goods_issued || 0) + qty, 'issued')
          await updateProductionCount(id, 'goods_in_hand', (prod?.goods_in_hand || 0) + qty)
          break;
        case 'produce':
           await updateProductionCount(id, 'goods_produced', (prod?.goods_produced || 0) + qty, 'production')
           await updateProductionCount(id, 'goods_in_hand', Math.max(0, (prod?.goods_in_hand || 0) - qty))
           break;
        case 'alteration':
           await updateProductionCount(id, 'alteration_count', (prod?.alteration_count || 0) + qty, 'alteration')
           break;
        case 'qc':
           await updateProductionCount(id, 'qc_passed', (prod?.qc_passed || 0) + qty, 'qc')
            break;
        case 'pack':
           await updateProductionCount(id, 'packing_completed', (prod?.packing_completed || 0) + qty, 'packing')
           break;
      }
      refetch()
    } catch (e) {
      console.error(e)
    }
  }

  const filteredWorkers = useMemo(() => {
    return workers.filter(w => {
      if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [workers, production, search])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-0">
      {/* Sticky Search Header (Within List Context, stays pinned below Date Picker) */}
      <div className="sticky top-0 z-40 bg-black/95 pt-0 pb-3 backdrop-blur-md -mx-1 px-1">
         <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-white h-9 w-full text-sm rounded-lg focus-visible:ring-1 focus-visible:ring-indigo-500 placeholder:text-zinc-600"
            />
         </div>
      </div>

      {/* Dense List */}
      <div className="divide-y divide-zinc-900 border-t border-zinc-900">
        {filteredWorkers.map((worker) => {
          const prod = production.find(p => p.worker_id === worker.id)
          const issued = prod?.goods_issued || 0 
          const produced = prod?.goods_produced || 0
          const alteration = prod?.alteration_count || 0
          const qc = prod?.qc_passed || 0
          
          const isExpanded = expandedId === worker.id
          
          return (
            <div key={worker.id} className="bg-transparent transition-colors">
              {/* Compact Row */}
              <div 
                onClick={() => toggleExpand(worker.id)}
                className="flex items-center justify-between py-3 px-1 cursor-pointer active:bg-zinc-900/30"
              >
                 <div className="flex items-center gap-3 overflow-hidden">
                    <h3 className="font-medium text-zinc-200 text-sm truncate">{worker.name}</h3>
                    {(alteration > 0 || qc > 0) && (
                        <div className="flex gap-1">
                            {alteration > 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-500"/>}
                            {qc > 0 && <span className="h-1.5 w-1.5 rounded-full bg-purple-500"/>}
                        </div>
                    )}
                 </div>
                 
                 <div className="flex gap-4 text-right items-center">
                    <div className="w-12">
                         <span className={cn("text-base font-bold tabular-nums block", issued > 0 ? "text-blue-400" : "text-zinc-700")}>{issued}</span>
                         <span className="text-[9px] text-zinc-600 uppercase font-bold block -mt-0.5">Issue</span>
                    </div>
                    <div className="w-12">
                         <span className={cn("text-base font-bold tabular-nums block", produced > 0 ? "text-emerald-500" : "text-zinc-700")}>{produced}</span>
                         <span className="text-[9px] text-zinc-600 uppercase font-bold block -mt-0.5">Done</span>
                    </div>
                    
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-600"/> : <ChevronDown className="h-4 w-4 text-zinc-600"/>}
                 </div>
              </div>

              {/* Expanded Details / Controls */}
              {isExpanded && (
                <div className="pb-4 px-1 animate-in slide-in-from-top-2 duration-200">
                   {/* Micro Stats Row if needed */}
                   {(alteration > 0 || qc > 0) && (
                      <div className="flex gap-3 mb-3 text-xs justify-end px-2">
                         {alteration > 0 && <span className="text-red-400 font-medium">Alter: {alteration}</span>}
                         {qc > 0 && <span className="text-purple-400 font-medium">QC: {qc}</span>}
                      </div>
                   )}
                   
                   <HandoverControls 
                      production={prod}
                      workerId={worker.id}
                      workerName={worker.name}
                      date={date}
                      onUpdate={(type, qty) => handleUpdate(worker.id, prod, type, qty)}
                   />
                </div>
              )}
            </div>
          )
        })}
        
        {filteredWorkers.length === 0 && (
          <div className="py-12 text-center text-zinc-700 text-sm">
             No workers found
          </div>
        )}
      </div>
    </div>
  )
}
