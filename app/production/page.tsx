"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useFactoryData } from "@/hooks/useFactoryData"
import { WorkerList } from "@/components/workflow/WorkerList"

export default function ProductionPage() {
  const [date, setDate] = useState<Date>(new Date())
  
  // Quick navigation
  const nextDay = () => setDate(d => new Date(d.setDate(d.getDate() + 1)))
  const prevDay = () => setDate(d => new Date(d.setDate(d.getDate() - 1)))
  
  const dateStr = format(date, "yyyy-MM-dd")
  const { workers, production, loading, refetch } = useFactoryData(dateStr)

  return (
    <div className="flex flex-col h-screen pb-20 pt-safe bg-black">
       {/* Sticky Header Area */}
       <div className="flex-none bg-black/80 backdrop-blur-xl border-b border-zinc-900 z-50 sticky top-0 px-4 py-2">
          {/* Date Picker Row */}
          <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
            <Button variant="ghost" size="icon" onClick={prevDay} className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full">
                <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"ghost"}
                  className={cn(
                    "h-9 px-4 justify-center font-semibold text-white hover:bg-zinc-800 text-sm rounded-full border border-zinc-800 bg-zinc-900/50",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-indigo-400" />
                  {date ? format(date, "EEE, MMM d") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800 text-white" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="bg-zinc-950 text-white"
                />
              </PopoverContent>
            </Popover>

             <Button variant="ghost" size="icon" onClick={nextDay} className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full">
                <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 scroll-smooth">
        <div className="max-w-lg mx-auto min-h-[400px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-60 gap-3 text-zinc-500">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
               <p className="text-xs">Loading...</p>
             </div>
          ) : (
            <WorkerList 
              workers={workers}
              production={production}
              date={dateStr}
              refetch={refetch}
            />
          )}
        </div>
      </div>
    </div>
  )
}
