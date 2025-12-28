"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, User, Search, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getWorkers, createWorker } from "@/lib/supabase/queries"
import { Worker } from "@/types"

const workerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  const form = useForm<z.infer<typeof workerSchema>>({
    resolver: zodResolver(workerSchema) as any,
    defaultValues: { name: "" },
  })

  const fetchWorkers = async () => {
    try {
      setLoading(true)
      const data = await getWorkers()
      setWorkers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkers()
  }, [])

  const onSubmit = async (values: z.infer<typeof workerSchema>) => {
    try {
      await createWorker(values.name, "Staff")
      setIsOpen(false)
      form.reset()
      fetchWorkers()
    } catch (error) {
      console.error("Failed to create worker", error)
    }
  }

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-24 fade-in slide-in-from-bottom-4 duration-500 animate-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-white">Team Members</h1>
           <p className="text-zinc-400">Manage your factory staff roster.</p>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-12 sm:h-10 text-lg sm:text-sm">
              <Plus className="h-5 w-5 sm:h-4 sm:w-4" /> Add Worker
            </Button>
          </SheetTrigger>
          {/* Changed side to "bottom" for mobile friendliness */}
          <SheetContent side="bottom" className="border-t border-zinc-800 bg-zinc-950 text-white rounded-t-[20px] max-h-[85vh]">
            <SheetHeader className="text-left">
              <SheetTitle className="text-white">Add New Worker</SheetTitle>
              <SheetDescription className="text-zinc-400">
                Enter the name of the new staff member.
              </SheetDescription>
            </SheetHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                          <Input 
                            placeholder="e.g. John Doe" 
                            className="pl-10 h-12 bg-zinc-900 border-zinc-800 text-white text-lg focus-visible:ring-indigo-500" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <SheetFooter className="mt-8">
                   <Button type="submit" className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700">Add Worker</Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
        <Input 
          placeholder="Search workers..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 bg-zinc-900/50 border-zinc-800 text-white text-lg focus-visible:ring-indigo-500"
        />
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
           Array.from({length: 4}).map((_, i) => (
             <Card key={i} className="bg-zinc-900/30 border-zinc-800 animate-pulse h-20" />
           ))
        ) : filteredWorkers.map((worker) => (
          <Card key={worker.id} className="group border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 transition-all active:scale-[0.98]">
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-10 w-10 border border-zinc-700">
                <AvatarFallback className="bg-zinc-800 text-indigo-400 font-bold">
                  {worker.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg text-white">{worker.name}</h3>
                <p className="text-xs text-zinc-500">{worker.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
