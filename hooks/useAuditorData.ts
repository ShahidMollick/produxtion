"use client"

import { useState, useEffect } from "react"
import { getProductionByDateRange } from "@/lib/supabase/queries"
import { DailyProduction } from "@/types"
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns"

export type DateRangeType = 'today' | 'week' | 'month'

export function useAuditorData(range: DateRangeType) {
  const [data, setData] = useState<DailyProduction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const now = new Date()
      let start = now
      let end = now

      if (range === 'today') {
        start = startOfDay(now)
        end = endOfDay(now)
      } else if (range === 'week') {
        start = startOfWeek(now, { weekStartsOn: 1 })
        end = endOfWeek(now, { weekStartsOn: 1 })
      } else if (range === 'month') {
        start = startOfMonth(now)
        end = endOfMonth(now)
      }

      try {
        const res = await getProductionByDateRange(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'))
        setData(res)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [range])

  const totals = {
    issued: data.reduce((acc, p) => acc + (p.goods_issued || 0), 0),
    produced: data.reduce((acc, p) => acc + (p.goods_produced || 0), 0),
    alteration: data.reduce((acc, p) => acc + (p.alteration_count || 0), 0),
    qc: data.reduce((acc, p) => acc + (p.qc_passed || 0), 0), // Assuming passed count
    packed: data.reduce((acc, p) => acc + (p.packing_completed || 0), 0),
    // For auditors: wastage/loss could be calculated if we tracked reject count specifically
  }

  return { data, totals, loading }
}
