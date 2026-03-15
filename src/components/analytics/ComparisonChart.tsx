import { useMemo, useState } from 'react'
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

function computeMovingAverages(
  data: ChartDataPoint[],
  keys: string[],
  window: number
): ChartDataPoint[] {
  return data.map((point, i) => {
    const avgPoint: ChartDataPoint = { ...point }
    keys.forEach(key => {
      const avgKey = `${key}_avg`
      // Collect non-null values in the window
      const windowValues: number[] = []
      for (let j = Math.max(0, i - window + 1); j <= i; j++) {
        const val = data[j][key]
        if (typeof val === 'number') windowValues.push(val)
      }
      avgPoint[avgKey] = windowValues.length >= Math.min(window, 3)
        ? windowValues.reduce((a, b) => a + b, 0) / windowValues.length
        : undefined
    })
    return avgPoint
  })
}

export default function ComparisonChart({
  measurements,
  selectedIds,
  entries
}: ComparisonChartProps) {
  const [showAverage, setShowAverage] = useState(false)
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

  const chartDataWithAvg = useMemo(() => {
    if (!chartData.length) return chartData
    return computeMovingAverages(chartData, selectedIds, 7)
  }, [chartData, selectedIds])

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
            Percentage change from baseline{showAverage ? ' (7-point avg)' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAverage(!showAverage)}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
        >
          <span className="text-xs">Avg</span>
          <div className={`relative w-9 h-5 rounded-full transition-colors
                          ${showAverage
                            ? 'bg-green-500'
                            : 'bg-slate-300 dark:bg-slate-600'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                            ${showAverage ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartDataWithAvg} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
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
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null

                return (
                  <div className="bg-surface-light dark:bg-surface-dark border border-slate-200
                                  dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[180px]">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                      {payload[0]?.payload?.fullDate}
                    </p>
                    <div className="space-y-1.5">
                      {payload.map((entry: any, index: number) => {
                        const dataKey = showAverage
                          ? (entry.dataKey as string).replace('_avg', '')
                          : entry.dataKey
                        const measurement = selectedMeasurements.find(m => m.id === dataKey)
                        if (!measurement) return null

                        const rawValue = entry.payload[`${dataKey}_raw`]
                        const val = entry.value

                        if (val == null) return null

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
                                             ${val < 0
                                               ? 'text-green-600 dark:text-green-400'
                                               : val > 0
                                                 ? 'text-red-600 dark:text-red-400'
                                                 : 'text-slate-600 dark:text-slate-400'
                                             }`}>
                                {val > 0 ? '+' : ''}{val?.toFixed(1)}%
                              </span>
                              {rawValue !== undefined && !showAverage && (
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
                const id = showAverage ? value.replace('_avg', '') : value
                const measurement = selectedMeasurements.find(m => m.id === id)
                return measurement?.name || value
              }}
            />
            {selectedIds.map((id, index) => (
              <Line
                key={id}
                type="monotone"
                dataKey={showAverage ? `${id}_avg` : id}
                name={showAverage ? `${id}_avg` : id}
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
