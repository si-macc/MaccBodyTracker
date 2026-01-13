import { ChevronDown } from 'lucide-react'
import type { MeasurementWithLatest } from '@/types'

interface MeasurementSelectProps {
  measurements: MeasurementWithLatest[]
  selectedId: string | null
  onChange: (id: string) => void
}

export default function MeasurementSelect({ 
  measurements, 
  selectedId, 
  onChange 
}: MeasurementSelectProps) {
  const selected = measurements.find(m => m.id === selectedId)

  // Group measurements by category
  const grouped = measurements.reduce((acc, m) => {
    if (!acc[m.category]) {
      acc[m.category] = []
    }
    acc[m.category].push(m)
    return acc
  }, {} as Record<string, MeasurementWithLatest[]>)

  const categoryOrder = ['Body Composition', 'Circumference', 'Skinfold', 'Other']
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  )

  return (
    <div className="relative">
      <select
        value={selectedId || ''}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full px-4 py-2 pr-10 bg-surface-light dark:bg-surface-dark 
                   border border-slate-200 dark:border-slate-700 rounded-lg
                   text-sm font-medium text-slate-700 dark:text-slate-300
                   focus:outline-none focus:ring-2 focus:ring-primary-500
                   cursor-pointer"
      >
        <option value="">Select a measurement</option>
        {sortedCategories.map((category) => (
          <optgroup key={category} label={category}>
            {grouped[category].map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}
