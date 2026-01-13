import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts'
import { format } from 'date-fns'
import { CHART_COLORS } from './MeasurementMultiSelect'
import type { MeasurementEntry, MeasurementWithLatest } from '@/types'

interface ComparisonChartProps {
  measurements: MeasurementWithLatest[]
  selectedIds: string[]
  entries: MeasurementEntry[]
}

interface ChartDataPoint {
  date: number
  formattedDate: string
  fullDate: string
  [key: string]: number | string | undefined
}

export default function ComparisonChart({ 
  measurements, 
  selectedIds, 
  entries 
}: ComparisonChartProps) {
  const selectedMeasurements = useMemo(() => {
    return selectedIds
      .map(id => measurements.find(m => m.id === id))
      .filter((m): m is MeasurementWithLatest => m !== undefined)
  }, [measurements, selectedIds])

  // Calculate percentage change data for all selected measurements
  const { chartData, measurementStats } = useMemo(() => {
    if (!selectedIds.length || !entries.length) {
      return { chartData: [], measurementStats: {} }
    }

    // Get entries grouped by measurement
    const entriesByMeasurement: Record<string, MeasurementEntry[]> = {}
    selectedIds.forEach(id => {
      entriesByMeasurement[id] = entries
        .filter(e => e.measurement_id === id)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    })

    // Get baseline (first value) for each measurement
    const baselines: Record<string, number> = {}
    selectedIds.forEach(id => {
      const measurementEntries = entriesByMeasurement[id]
      if (measurementEntries?.length > 0) {
        baselines[id] = measurementEntries[0].value
      }
    })

    // Get all unique dates across all measurements
    const allDates = new Set<number>()
    Object.values(entriesByMeasurement).forEach(measurementEntries => {
      measurementEntries.forEach(e => {
        // Round to day for grouping
        const date = new Date(e.recorded_at)
        date.setHours(0, 0, 0, 0)
        allDates.add(date.getTime())
      })
    })

    // Sort dates
    const sortedDates = Array.from(allDates).sort((a, b) => a - b)

    // Build chart data with percentage changes
    const data: ChartDataPoint[] = sortedDates.map(dateTimestamp => {
      const date = new Date(dateTimestamp)
      const dataPoint: ChartDataPoint = {
        date: dateTimestamp,
        formattedDate: format(date, 'MMM d'),
        fullDate: format(date, 'MMM d, yyyy')
      }

      // For each measurement, find the entry closest to this date (same day or interpolate)
      selectedIds.forEach(id => {
        const measurementEntries = entriesByMeasurement[id]
        const baseline = baselines[id]
        
        if (!measurementEntries?.length || baseline === undefined) return

        // Find entry on this day
        const entryOnDay = measurementEntries.find(e => {
          const entryDate = new Date(e.recorded_at)
          entryDate.setHours(0, 0, 0, 0)
          return entryDate.getTime() === dateTimestamp
        })

        if (entryOnDay) {
          const percentChange = ((entryOnDay.value - baseline) / baseline) * 100
          dataPoint[id] = percentChange
          dataPoint[`${id}_raw`] = entryOnDay.value
        }
      })

      return dataPoint
    })

    // Calculate stats for each measurement
    const stats: Record<string, { 
      first: number
      last: number
      change: number
      changePercent: number
      min: number
      max: number 
    }> = {}

    selectedIds.forEach(id => {
      const measurementEntries = entriesByMeasurement[id]
      if (!measurementEntries?.length) return

      const values = measurementEntries.map(e => e.value)
      const first = values[0]
      const last = values[values.length - 1]
      
      stats[id] = {
        first,
        last,
        change: last - first,
        changePercent: first !== 0 ? ((last - first) / first) * 100 : 0,
        min: Math.min(...values),
        max: Math.max(...values)
      }
    })

    return { chartData: data, measurementStats: stats }
  }, [selectedIds, entries])

  if (selectedIds.length === 0) {
    return (
      <div className="card p-8 flex items-center justify-center h-[400px]">
        <p className="text-slate-500 dark:text-slate-400">
          Select measurements to compare trends
        </p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="card p-8 flex items-center justify-center h-[400px]">
        <p className="text-slate-500 dark:text-slate-400">
          No data available for the selected measurements in this period
        </p>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Progress Comparison
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Percentage change from baseline
          </p>
        </div>
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="currentColor" 
              className="text-slate-200 dark:text-slate-700" 
            />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-slate-500 dark:text-slate-400"
            />
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-slate-500 dark:text-slate-400"
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <ReferenceLine 
              y={0} 
              stroke="#94a3b8" 
              strokeDasharray="3 3"
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                
                return (
                  <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 
                                  dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[180px]">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                      {payload[0]?.payload?.fullDate}
                    </p>
                    <div className="space-y-1.5">
                      {payload.map((entry: any, index: number) => {
                        const measurement = selectedMeasurements.find(m => m.id === entry.dataKey)
                        if (!measurement) return null
                        
                        const rawValue = entry.payload[`${entry.dataKey}_raw`]
                        
                        return (
                          <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-xs text-slate-600 dark:text-slate-300">
                                {measurement.name}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-semibold
                                             ${entry.value < 0 
                                               ? 'text-green-600 dark:text-green-400' 
                                               : entry.value > 0 
                                                 ? 'text-red-600 dark:text-red-400'
                                                 : 'text-slate-600 dark:text-slate-400'
                                             }`}>
                                {entry.value > 0 ? '+' : ''}{entry.value?.toFixed(1)}%
                              </span>
                              {rawValue !== undefined && (
                                <span className="text-xs text-slate-400 ml-1">
                                  ({rawValue.toFixed(1)})
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }}
            />
            <Legend 
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const measurement = selectedMeasurements.find(m => m.id === value)
                return measurement?.name || value
              }}
            />
            {selectedIds.map((id, index) => (
              <Line 
                key={id}
                type="monotone" 
                dataKey={id}
                name={id}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: CHART_COLORS[index % CHART_COLORS.length] }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Summary (Change from Start)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {selectedMeasurements.map((m, index) => {
            const stats = measurementStats[m.id]
            if (!stats) return null

            return (
              <div 
                key={m.id}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                    {m.name}
                  </span>
                </div>
                <div className={`text-lg font-bold
                               ${stats.changePercent < 0 
                                 ? 'text-green-600 dark:text-green-400' 
                                 : stats.changePercent > 0 
                                   ? 'text-red-600 dark:text-red-400'
                                   : 'text-slate-600 dark:text-slate-400'
                               }`}>
                  {stats.changePercent > 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {stats.first.toFixed(1)} → {stats.last.toFixed(1)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
