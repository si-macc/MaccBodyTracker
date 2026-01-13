import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { format } from 'date-fns'
import { useSettings } from '@/contexts/SettingsContext'
import { convertUnit, getDisplayUnit } from '@/lib/utils'
import type { MeasurementEntry, MeasurementWithLatest } from '@/types'

interface ProgressChartProps {
  measurement: MeasurementWithLatest | null
  entries: MeasurementEntry[]
}

export default function ProgressChart({ measurement, entries }: ProgressChartProps) {
  const { settings } = useSettings()

  const chartData = useMemo(() => {
    if (!measurement || !entries.length) return []

    return entries
      .filter(e => e.measurement_id === measurement.id)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .map(entry => {
        const displayValue = settings.unit_system === 'imperial'
          ? convertUnit(entry.value, measurement.unit_metric, measurement.unit_imperial)
          : entry.value

        return {
          date: new Date(entry.recorded_at).getTime(),
          value: displayValue,
          formattedDate: format(new Date(entry.recorded_at), 'MMM d'),
          fullDate: format(new Date(entry.recorded_at), 'MMM d, yyyy h:mm a'),
          rawValue: entry.value
        }
      })
  }, [measurement, entries, settings.unit_system])

  const stats = useMemo(() => {
    if (!chartData.length) return null

    const values = chartData.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const first = values[0]
    const last = values[values.length - 1]
    const change = last - first
    const changePercent = first !== 0 ? ((change / first) * 100) : 0

    return { min, max, avg, first, last, change, changePercent }
  }, [chartData])

  if (!measurement) {
    return (
      <div className="card p-8 flex items-center justify-center h-[400px]">
        <p className="text-slate-500 dark:text-slate-400">
          Select a measurement to view progress
        </p>
      </div>
    )
  }

  if (!chartData.length) {
    return (
      <div className="card p-8 flex items-center justify-center h-[400px]">
        <p className="text-slate-500 dark:text-slate-400">
          No data available for this period
        </p>
      </div>
    )
  }

  const displayUnit = getDisplayUnit(measurement, settings.unit_system)

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {measurement.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {chartData.length} entries
          </p>
        </div>
        {stats && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium
                          ${stats.change < 0 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : stats.change > 0 
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
            {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)} {displayUnit}
            {' '}({stats.changePercent > 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%)
          </div>
        )}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const data = payload[0].payload
                return (
                  <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 
                                  dark:border-slate-700 rounded-lg shadow-lg p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {data.fullDate}
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {data.value.toFixed(1)} {displayUnit}
                    </p>
                  </div>
                )
              }}
            />
            {stats && (
              <ReferenceLine 
                y={stats.avg} 
                stroke="#3B5B7A" 
                strokeDasharray="5 5"
                label={{ 
                  value: `Avg: ${stats.avg.toFixed(1)}`, 
                  position: 'right',
                  fontSize: 11,
                  fill: '#3B5B7A'
                }}
              />
            )}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B5B7A" 
              strokeWidth={2}
              dot={{ fill: '#3B5B7A', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#3B5B7A' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">First</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stats.first.toFixed(1)} <span className="text-sm font-normal text-slate-500">{displayUnit}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Latest</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stats.last.toFixed(1)} <span className="text-sm font-normal text-slate-500">{displayUnit}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Min</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stats.min.toFixed(1)} <span className="text-sm font-normal text-slate-500">{displayUnit}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Max</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stats.max.toFixed(1)} <span className="text-sm font-normal text-slate-500">{displayUnit}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
