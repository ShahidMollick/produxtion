"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { DailyProduction } from "@/types"
import { Plus, Check, Scissors, ClipboardCheck, Package, ArrowRight } from "lucide-react"

const actionSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
})

type ActionType = 'issue' | 'produce' | 'alteration' | 'qc' | 'pack'

interface HandoverControlsProps {
  production?: DailyProduction
  workerId: string
  workerName: string
  date: string
  onUpdate: (type: ActionType, quantity: number) => Promise<void>
}

export function HandoverControls({ production, workerName, onUpdate }: HandoverControlsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [actionType, setActionType] = useState<ActionType | null>(null)
  
  const form = useForm<z.infer<typeof actionSchema>>({
    resolver: zodResolver(actionSchema) as any,
    defaultValues: { quantity: 0 },
  })

  const handleAction = (type: ActionType) => {
    setActionType(type)
    form.reset({ quantity: 0 })
    setIsOpen(true)
  }

  const onSubmit = async (values: z.infer<typeof actionSchema>) => {
    if (!actionType) return
    try {
      await onUpdate(actionType, values.quantity)
      setIsOpen(false)
    } catch (error) {
      console.error("Update failed", error)
    }
  }

  const getTitle = () => {
    switch (actionType) {
      case 'issue': return "Issue Goods"
      case 'produce': return "Record Production"
      case 'alteration': return "Record Alterations"
      case 'qc': return "QC Check"
      case 'pack': return "Finalize"
      default: return "Update"
    }
  }

  const hasIssued = (production?.goods_issued || 0) > 0
  const hasInHand = (production?.goods_in_hand || 0) > 0

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Primary Action Button - Reduced Height, Elegant */}
      {!hasIssued ? (
         <Button 
            className="w-full h-11 text-sm font-semibold bg-zinc-100 text-zinc-900 hover:bg-white rounded-lg active:scale-[0.98] transition-all"
            onClick={() => handleAction('issue')}
          >
            <Plus className="h-4 w-4 mr-2" /> Issue Goods
          </Button>
      ) : hasInHand ? (
          <Button 
            className="w-full h-11 text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-sm shadow-indigo-900/20 active:scale-[0.98] transition-all"
            onClick={() => handleAction('produce')}
          >
            <Package className="h-4 w-4 mr-2" /> Record Production
          </Button>
      ) : (
          <Button 
            className="w-full h-11 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm shadow-emerald-900/20 active:scale-[0.98] transition-all"
            onClick={() => handleAction('pack')}
          >
            <Check className="h-4 w-4 mr-2" /> Pack / Finish
          </Button>
      )}

      {/* Secondary Actions Row - Minimalist Icons */}
      {hasIssued && (
        <div className="flex gap-2 justify-between px-1">
            <button 
              className="group flex flex-col items-center gap-1 p-2 rounded-md hover:bg-zinc-800/50 transition-colors"
              onClick={() => handleAction('issue')}
            >
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700">
                  <Plus className="h-4 w-4 text-zinc-400 group-hover:text-white" />
              </div>
              <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest group-hover:text-zinc-400">Add</span>
            </button>

            <button 
              className="group flex flex-col items-center gap-1 p-2 rounded-md hover:bg-zinc-800/50 transition-colors"
              onClick={() => handleAction('alteration')}
            >
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-red-900/20">
                  <Scissors className="h-4 w-4 text-zinc-400 group-hover:text-red-400" />
              </div>
              <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest group-hover:text-red-400/80">Alter</span>
            </button>

            <button 
              className="group flex flex-col items-center gap-1 p-2 rounded-md hover:bg-zinc-800/50 transition-colors"
              onClick={() => handleAction('qc')}
            >
               <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-purple-900/20">
                  <ClipboardCheck className="h-4 w-4 text-zinc-400 group-hover:text-purple-400" />
              </div>
              <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest group-hover:text-purple-400/80">QC</span>
            </button>
             
            <button 
              className="group flex flex-col items-center gap-1 p-2 rounded-md hover:bg-zinc-800/50 transition-colors"
              onClick={() => handleAction('pack')}
            >
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-blue-900/20">
                  <Check className="h-4 w-4 text-zinc-400 group-hover:text-blue-400" />
              </div>
              <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest group-hover:text-blue-400/80">Pack</span>
            </button>
        </div>
      )}

      {/* Input Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="border-t border-zinc-900 bg-[#09090b] text-white rounded-t-[20px] pb-safe px-6 pt-6">
          <SheetHeader className="text-left mb-6">
            <div className="flex items-center justify-between">
                <SheetTitle className="text-white text-xl font-medium">{getTitle()}</SheetTitle>
                <div className="text-sm text-zinc-500 font-medium">{workerName}</div>
            </div>
            {/* Removed description to save space and reduce noise */}
          </SheetHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                        <div className="relative">
                            <Input 
                                type="number" 
                                className="text-4xl h-20 bg-zinc-900/50 border-zinc-800 text-white text-center rounded-xl focus-visible:ring-indigo-500 font-bold placeholder:text-zinc-800" 
                                placeholder="0" 
                                autoFocus
                                {...field} 
                            />
                            {/* <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm font-medium">pcs</div> */}
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <SheetFooter>
                 <Button type="submit" className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-zinc-200 rounded-xl">
                    Confirm
                 </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
