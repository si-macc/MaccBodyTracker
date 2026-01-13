import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Card from '@/components/common/Card'
import { useSettings } from '@/contexts/SettingsContext'
import { formatDate, formatValue, convertUnit, getDisplayUnit } from '@/lib/utils'
import type { MeasurementWithLatest } from '@/types'

interface MeasurementCardProps {
  measurement: MeasurementWithLatest
  previousValue?: number
  onClick: () => void
}

export default function MeasurementCard({ measurement, previousValue, onClick }: MeasurementCardProps) {
  const { settings } = useSettings()
  const { name, unit_metric, unit_imperial, category, latest_entry } = measurement

  const displayUnit = getDisplayUnit(unit_metric, unit_imperial, settings.unit_system)
  
  const currentValue = latest_entry
    ? convertUnit(latest_entry.value, unit_metric, settings.unit_system)
    : null

  const prevValue = previousValue
    ? convertUnit(previousValue, unit_metric, settings.unit_system)
    : null

  // Calculate trend
  const getTrend = () => {
    if (currentValue === null || prevValue === null) return null
    const diff = currentValue - prevValue
    if (Math.abs(diff) < 0.01) return 'same'
    return diff > 0 ? 'up' : 'down'
  }

  const trend = getTrend()

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'same':
        return <Minus className="w-4 h-4 text-slate-400" />
      default:
        return null
    }
  }

  return (
    <Card
      hoverable
      onClick={onClick}
      className="p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* Category badge */}
          <span className="inline-block text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
            {category}
          </span>
          
          {/* Measurement name */}
          <h3 className="text-base font-medium text-slate-900 dark:text-white truncate">
            {name}
          </h3>

          {/* Latest value and date */}
          <div className="flex items-center gap-2 mt-1">
            {currentValue !== null ? (
              <>
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                  {formatValue(currentValue, displayUnit)}
                </span>
                {getTrendIcon()}
              </>
            ) : (
              <span className="text-sm text-slate-400 dark:text-slate-500">
                No data
              </span>
            )}
          </div>

          {/* Last recorded date */}
          {latest_entry && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatDate(latest_entry.recorded_at)}
            </p>
          )}
        </div>

        {/* Arrow icon */}
        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2" />
      </div>
    </Card>
  )
}
