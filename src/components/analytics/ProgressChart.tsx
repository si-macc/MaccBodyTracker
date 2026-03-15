import { useMemo, useState } from 'react'
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

function computeMovingAverage(data: { value: number }[], window: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < window - 1) return null
    const slice = data.slice(i - window + 1, i + 1)
    return slice.reduce((sum, d) => sum + d.value, 0) / slice.length
  })
}

interface ProgressChartProps {
  measurement: MeasurementWithLatest | null
  entries: MeasurementEntry[]
}

export default function ProgressChart({ measurement, entries }: ProgressChartProps) {
  const { settings } = useSettings()
  const [showAverage, setShowAverage] = useState(false)

  const chartData = useMemo(() => {
    if (!measurement || !entries.length) return []

    return entries
      .filter(e => e.measurement_id === measurement.id)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .map(entry => {
        const displayValue = settings.unit_system === 'imperial'
          ? convertUnit(entry.value, measurement.unit_metric, 'imperial')
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

  const chartDataWithAvg = useMemo(() => {
    if (!chartData.length) return chartData
    const avgValues = computeMovingAverage(chartData, 7)
    return chartData.map((d, i) => ({
      ...d,
      avg: avgValues[i]
    }))
  }, [chartData])

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

  const displayUnit = getDisplayUnit(measurement.unit_metric, measurement.unit_imperial, settings.unit_system as 'metric' | 'imperial')

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {measurement.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {chartData.length} entries{showAverage ? ' (7-point avg)' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartDataWithAvg} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
                const displayVal = showAverage ? data.avg : data.value
                if (displayVal == null) return null
                return (
                  <div className="bg-surface-light dark:bg-surface-dark border border-slate-200
                                  dark:border-slate-700 rounded-lg shadow-lg p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {data.fullDate}
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {displayVal.toFixed(1)} {displayUnit}
                    </p>
                    {showAverage && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Actual: {data.value.toFixed(1)} {displayUnit}
                      </p>
                    )}
                  </div>
                )
              }}
            />
            {stats && !showAverage && (
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
              dataKey={showAverage ? 'avg' : 'value'}
              stroke="#3B5B7A"
              strokeWidth={2}
              dot={{ fill: '#3B5B7A', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#3B5B7A' }}
              connectNulls={false}
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
