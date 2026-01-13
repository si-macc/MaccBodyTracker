import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns'

export interface DateRange {
  start: Date
  end: Date
  label: string
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 6 months', months: 6 },
  { label: 'Last year', years: 1 },
  { label: 'All time', all: true },
]

export function getDefaultDateRange(): DateRange {
  return {
    start: subDays(startOfDay(new Date()), 30),
    end: endOfDay(new Date()),
    label: 'Last 30 days'
  }
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const handlePresetClick = (preset: typeof presets[0]) => {
    const end = endOfDay(new Date())
    let start: Date

    if (preset.all) {
      start = new Date(2020, 0, 1) // Far back date for "all time"
    } else if (preset.years) {
      start = startOfDay(subYears(new Date(), preset.years))
    } else if (preset.months) {
      start = startOfDay(subMonths(new Date(), preset.months))
    } else {
      start = startOfDay(subDays(new Date(), preset.days || 30))
    }

    onChange({ start, end, label: preset.label })
    setIsOpen(false)
  }

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      const start = startOfDay(new Date(customStart))
      const end = endOfDay(new Date(customEnd))
      
      if (start <= end) {
        onChange({
          start,
          end,
          label: `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`
        })
        setIsOpen(false)
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-surface-light dark:bg-surface-dark 
                   border border-slate-200 dark:border-slate-700 rounded-lg
                   hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <Calendar className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {value.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 z-20 bg-surface-light dark:bg-surface-dark 
                          border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg 
                          min-w-[280px] overflow-hidden">
            {/* Presets */}
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1">
                Quick Select
              </p>
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                             ${value.label === preset.label 
                               ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                               : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                             }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Range */}
            <div className="p-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Custom Range
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 
                               rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 
                               rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <button
                  onClick={handleCustomApply}
                  disabled={!customStart || !customEnd}
                  className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm 
                             font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
