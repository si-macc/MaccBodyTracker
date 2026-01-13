import { useState, useEffect, useMemo } from 'react'
import { BarChart3, Activity, Scale, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useMeasurements } from '@/hooks/useMeasurements'
import { useSettings } from '@/contexts/SettingsContext'
import { convertUnit, getDisplayUnit } from '@/lib/utils'
import {
  DateRangePicker,
  DateRange,
  getDefaultDateRange,
  MeasurementSelect,
  MeasurementMultiSelect,
  ProgressChart,
  ComparisonChart,
  StatsCard
} from '@/components/analytics'
import Loading from '@/components/common/Loading'
import type { MeasurementEntry } from '@/types'

type ChartMode = 'single' | 'compare'

export default function AnalyticsPage() {
  const { measurements, isLoading: measurementsLoading } = useMeasurements()
  const { settings } = useSettings()
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange)
  const [chartMode, setChartMode] = useState<ChartMode>('compare')
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string | null>(null)
  const [selectedMeasurementIds, setSelectedMeasurementIds] = useState<string[]>([])
  const [entries, setEntries] = useState<MeasurementEntry[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)

  // Filter out calculated measurements (like Body Fat %)
  const chartableMeasurements = useMemo(() => {
    return measurements.filter(m => !m.is_calculated)
  }, [measurements])

  // Auto-select first measurement with entries
  useEffect(() => {
    if (!selectedMeasurementId && chartableMeasurements.length > 0) {
      // Prefer Weight, then first available
      const weight = chartableMeasurements.find(m => m.name === 'Weight')
      setSelectedMeasurementId(weight?.id || chartableMeasurements[0].id)
    }
    // Auto-select default measurements for comparison
    if (selectedMeasurementIds.length === 0 && chartableMeasurements.length > 0) {
      const defaultNames = ['Weight', 'Waist', 'Chest']
      const defaults = chartableMeasurements
        .filter(m => defaultNames.includes(m.name))
        .map(m => m.id)
      if (defaults.length > 0) {
        setSelectedMeasurementIds(defaults)
      } else {
        setSelectedMeasurementIds([chartableMeasurements[0].id])
      }
    }
  }, [chartableMeasurements, selectedMeasurementId, selectedMeasurementIds.length])

  // Fetch entries for date range
  useEffect(() => {
    async function fetchEntries() {
      setIsLoadingEntries(true)
      const { data, error } = await supabase
        .from('measurement_entries')
        .select('*')
        .gte('recorded_at', dateRange.start.toISOString())
        .lte('recorded_at', dateRange.end.toISOString())
        .order('recorded_at', { ascending: true })

      if (!error && data) {
        setEntries(data)
      }
      setIsLoadingEntries(false)
    }

    fetchEntries()
  }, [dateRange])

  const selectedMeasurement = useMemo(() => {
    return chartableMeasurements.find(m => m.id === selectedMeasurementId) || null
  }, [chartableMeasurements, selectedMeasurementId])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalEntries = entries.length
    const uniqueMeasurements = new Set(entries.map(e => e.measurement_id)).size
    
    // Find weight change
    const weightMeasurement = measurements.find(m => m.name === 'Weight')
    let weightChange: number | null = null
    let latestWeight: number | null = null
    
    if (weightMeasurement) {
      const weightEntries = entries
        .filter(e => e.measurement_id === weightMeasurement.id)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      
      if (weightEntries.length >= 1) {
        const firstWeight = weightEntries[0].value
        const lastWeight = weightEntries[weightEntries.length - 1].value
        weightChange = lastWeight - firstWeight
        
        // Convert for display
        latestWeight = settings.unit_system === 'imperial'
          ? convertUnit(lastWeight, weightMeasurement.unit_metric, weightMeasurement.unit_imperial)
          : lastWeight
          
        weightChange = settings.unit_system === 'imperial'
          ? convertUnit(weightChange, weightMeasurement.unit_metric, weightMeasurement.unit_imperial)
          : weightChange
      }
    }

    // Find body fat (latest)
    const bfMeasurement = measurements.find(m => m.name === 'Body Fat %')
    let latestBodyFat: number | null = null
    
    if (bfMeasurement) {
      const bfEntries = entries
        .filter(e => e.measurement_id === bfMeasurement.id)
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
      
      if (bfEntries.length > 0) {
        latestBodyFat = bfEntries[0].value
      }
    }

    return { totalEntries, uniqueMeasurements, weightChange, latestWeight, latestBodyFat }
  }, [entries, measurements, settings.unit_system])

  const weightUnit = useMemo(() => {
    const weightMeasurement = measurements.find(m => m.name === 'Weight')
    if (!weightMeasurement) return 'kg'
    return getDisplayUnit(weightMeasurement, settings.unit_system)
  }, [measurements, settings.unit_system])

  if (measurementsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your progress over time
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Entries"
          value={summaryStats.totalEntries}
          icon={BarChart3}
        />
        <StatsCard
          title="Measurements Tracked"
          value={summaryStats.uniqueMeasurements}
          icon={Activity}
        />
        {summaryStats.latestWeight !== null && (
          <StatsCard
            title="Current Weight"
            value={summaryStats.latestWeight}
            unit={weightUnit}
            change={summaryStats.weightChange || undefined}
            icon={Scale}
          />
        )}
        {summaryStats.latestBodyFat !== null && (
          <StatsCard
            title="Body Fat"
            value={summaryStats.latestBodyFat}
            unit="%"
            icon={Target}
          />
        )}
      </div>

      {/* Chart Section */}
      <div className="space-y-4">
        {/* Chart Mode Tabs */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setChartMode('compare')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                         ${chartMode === 'compare'
                           ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                           : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                         }`}
            >
              Compare Trends
            </button>
            <button
              onClick={() => setChartMode('single')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                         ${chartMode === 'single'
                           ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                           : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                         }`}
            >
              Single Measurement
            </button>
          </div>
          
          {isLoadingEntries && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loading size="sm" />
              Loading data...
            </div>
          )}
        </div>

        {/* Measurement Selection */}
        <div className="flex flex-col gap-4">
          {chartMode === 'compare' ? (
            <div className="max-w-2xl">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select measurements to compare (up to 8)
              </label>
              <MeasurementMultiSelect
                measurements={chartableMeasurements}
                selectedIds={selectedMeasurementIds}
                onChange={setSelectedMeasurementIds}
                maxSelections={8}
              />
            </div>
          ) : (
            <div className="sm:w-64">
              <MeasurementSelect
                measurements={chartableMeasurements}
                selectedId={selectedMeasurementId}
                onChange={setSelectedMeasurementId}
              />
            </div>
          )}
        </div>

        {/* Chart */}
        {chartMode === 'compare' ? (
          <ComparisonChart
            measurements={chartableMeasurements}
            selectedIds={selectedMeasurementIds}
            entries={entries}
          />
        ) : (
          <ProgressChart
            measurement={selectedMeasurement}
            entries={entries}
          />
        )}
      </div>

      {/* Recent Entries Table - Only show in single mode */}
      {chartMode === 'single' && selectedMeasurement && entries.filter(e => e.measurement_id === selectedMeasurement.id).length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Recent Entries
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Date
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Value
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries
                  .filter(e => e.measurement_id === selectedMeasurement.id)
                  .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
                  .slice(0, 10)
                  .map((entry, index, arr) => {
                    const displayValue = settings.unit_system === 'imperial'
                      ? convertUnit(entry.value, selectedMeasurement.unit_metric, selectedMeasurement.unit_imperial)
                      : entry.value
                    
                    const prevEntry = arr[index + 1]
                    let change: number | null = null
                    if (prevEntry) {
                      const prevValue = settings.unit_system === 'imperial'
                        ? convertUnit(prevEntry.value, selectedMeasurement.unit_metric, selectedMeasurement.unit_imperial)
                        : prevEntry.value
                      change = displayValue - prevValue
                    }

                    const displayUnit = getDisplayUnit(selectedMeasurement, settings.unit_system)

                    return (
                      <tr 
                        key={entry.id} 
                        className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                      >
                        <td className="py-3 text-sm text-slate-900 dark:text-slate-100">
                          {new Date(entry.recorded_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 text-sm text-right font-medium text-slate-900 dark:text-slate-100">
                          {displayValue.toFixed(1)} {displayUnit}
                        </td>
                        <td className={`py-3 text-sm text-right font-medium
                                       ${change === null ? 'text-slate-400' :
                                         change < 0 ? 'text-green-600 dark:text-green-400' :
                                         change > 0 ? 'text-red-600 dark:text-red-400' :
                                         'text-slate-400'}`}>
                          {change === null ? '—' : 
                           `${change > 0 ? '+' : ''}${change.toFixed(1)}`}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
