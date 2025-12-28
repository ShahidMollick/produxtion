"use client"

import { useState, useEffect, useCallback } from "react"
import { getWorkers, getDailyProduction } from "@/lib/supabase/queries"
import { Worker, DailyProduction } from "@/types"

export function useFactoryData(date: string) {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [production, setProduction] = useState<DailyProduction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [workersData, prodData] = await Promise.all([
        getWorkers(),
        getDailyProduction(date)
      ])
      setWorkers(workersData)
      setProduction(prodData)
    } catch (err: any) {
      console.error(err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    // If we have no credentials, don't try to fetch to avoid error spam in logs, 
    // unless we want to show the error.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn("Missing Supabase credentials")
      setLoading(false)
      return
    }
    fetchData()
  }, [fetchData])

  return { workers, production, loading, error, refetch: fetchData }
}
