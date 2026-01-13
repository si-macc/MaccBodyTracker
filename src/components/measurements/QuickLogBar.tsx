import { Scale, Ruler, Activity } from 'lucide-react'
import Button from '@/components/common/Button'
import type { MeasurementWithLatest } from '@/types'

interface QuickLogBarProps {
  measurements: MeasurementWithLatest[]
  onQuickLog: (measurement: MeasurementWithLatest) => void
  onLogJP3: () => void
}

// Priority measurements to show in quick log bar
const QUICK_LOG_NAMES = ['Weight', 'Waist', 'Chest']

export default function QuickLogBar({ measurements, onQuickLog, onLogJP3 }: QuickLogBarProps) {
  // Find the quick log measurements
  const quickLogMeasurements = QUICK_LOG_NAMES
    .map(name => measurements.find(m => m.name === name))
    .filter((m): m is MeasurementWithLatest => m !== undefined)

  if (quickLogMeasurements.length === 0 && measurements.length === 0) {
    return null
  }

  const getIcon = (name: string) => {
    switch (name) {
      case 'Weight':
        return <Scale className="w-4 h-4" />
      case 'Waist':
      case 'Chest':
        return <Ruler className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
        Quick Log
      </h3>
      <div className="flex flex-wrap gap-2">
        {quickLogMeasurements.map((measurement) => (
          <Button
            key={measurement.id}
            variant="secondary"
            size="sm"
            onClick={() => onQuickLog(measurement)}
            className="flex items-center gap-2"
          >
            {getIcon(measurement.name)}
            {measurement.name}
          </Button>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={onLogJP3}
          className="flex items-center gap-2 border-dashed border-2 border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
        >
          <Activity className="w-4 h-4" />
          JP3 Body Fat
        </Button>
      </div>
    </div>
  )
}
