import { createClient } from './client'
import { DailyProduction, Worker, WorkflowStage } from '@/types'

export const getWorkers = async () => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data as Worker[]
}

export const createWorker = async (name: string, role: string = 'worker') => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('workers')
    .insert({ name, role })
    .select()
    .single()
    
  if (error) throw error
  return data as Worker
}

export const getDailyProduction = async (date: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('daily_production')
    .select('*, worker:workers(name, role)')
    .eq('date', date)
  
  if (error) throw error
  return data as DailyProduction[]
}

export const getProductionByDateRange = async (startDate: string, endDate: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('daily_production')
    .select('*, worker:workers(name, role)')
    .gte('date', startDate)
    .lte('date', endDate)
  
  if (error) throw error
  return data as DailyProduction[]
}

export const getWorkerProduction = async (workerId: string, date: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('daily_production')
    .select('*')
    .eq('worker_id', workerId)
    .eq('date', date)
    .single()
  
  // If no record, return null (handled by UI to create one)
  if (error && error.code !== 'PGRST116') throw error
  return data as DailyProduction | null
}

export const initializeProduction = async (workerId: string, date: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('daily_production')
    .insert({
      worker_id: workerId,
      date: date,
      current_stage: 'idle'
    })
    .select()
    .single()
    
  if (error) throw error
  return data as DailyProduction
}

export const updateProductionCount = async (
  id: string, 
  field: keyof DailyProduction, 
  value: number,
  newStage?: WorkflowStage
) => {
  const supabase = createClient()
  
  const updatePayload: any = { [field]: value }
  if (newStage) updatePayload.current_stage = newStage
  
  const { data, error } = await supabase
    .from('daily_production')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()
    
  if (error) throw error
  return data as DailyProduction
}
