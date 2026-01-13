import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Check } from 'lucide-react'
import type { MeasurementWithLatest } from '@/types'

// Chart colors for different measurements
export const CHART_COLORS = [
  '#3B5B7A', // Primary (Sharky Blue)
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
]

interface MeasurementMultiSelectProps {
  measurements: MeasurementWithLatest[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  maxSelections?: number
}

export default function MeasurementMultiSelect({ 
  measurements, 
  selectedIds, 
  onChange,
  maxSelections = 8
}: MeasurementMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const selectedMeasurements = measurements.filter(m => selectedIds.includes(m.id))

  const toggleMeasurement = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id))
    } else if (selectedIds.length < maxSelections) {
      onChange([...selectedIds, id])
    }
  }

  const removeMeasurement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selectedIds.filter(i => i !== id))
  }

  const getColorForIndex = (index: number) => CHART_COLORS[index % CHART_COLORS.length]

  return (
    <div ref={containerRef} className="relative">
      {/* Selected items display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full min-h-[42px] px-3 py-2 
                   bg-surface-light dark:bg-surface-dark 
                   border border-slate-200 dark:border-slate-700 rounded-lg
                   hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors
                   text-left"
      >
        <div className="flex-1 flex flex-wrap gap-1.5">
          {selectedMeasurements.length === 0 ? (
            <span className="text-sm text-slate-400">Select measurements to compare...</span>
          ) : (
            selectedMeasurements.map((m, index) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: getColorForIndex(index) }}
              >
                {m.name}
                <X 
                  className="w-3 h-3 cursor-pointer hover:opacity-75" 
                  onClick={(e) => removeMeasurement(m.id, e)}
                />
              </span>
            ))
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 
                        bg-surface-light dark:bg-surface-dark 
                        border border-slate-200 dark:border-slate-700 
                        rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
          {sortedCategories.map((category) => (
            <div key={category}>
              <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 
                              bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                {category}
              </div>
              {grouped[category].map((m) => {
                const isSelected = selectedIds.includes(m.id)
                const selectedIndex = selectedIds.indexOf(m.id)
                const isDisabled = !isSelected && selectedIds.length >= maxSelections

                return (
                  <button
                    key={m.id}
                    onClick={() => toggleMeasurement(m.id)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left
                               transition-colors
                               ${isDisabled 
                                 ? 'opacity-50 cursor-not-allowed' 
                                 : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                               }
                               ${isSelected 
                                 ? 'bg-primary-50 dark:bg-primary-900/20' 
                                 : ''
                               }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                                 ${isSelected 
                                   ? 'border-transparent' 
                                   : 'border-slate-300 dark:border-slate-600'
                                 }`}
                      style={isSelected ? { backgroundColor: getColorForIndex(selectedIndex) } : {}}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`${isSelected ? 'font-medium' : ''} text-slate-700 dark:text-slate-300`}>
                      {m.name}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
          {selectedIds.length >= maxSelections && (
            <div className="px-3 py-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20">
              Maximum {maxSelections} measurements selected
            </div>
          )}
        </div>
      )}
    </div>
  )
}
