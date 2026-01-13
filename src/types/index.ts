// Measurement type definition
export interface Measurement {
  id: string
  name: string
  unit_metric: string
  unit_imperial: string
  category: string
  sort_order: number
  is_default: boolean
  is_calculated?: boolean  // For JP3 Body Fat %
  created_at: string
  updated_at: string
}

// Measurement entry (data point)
export interface MeasurementEntry {
  id: string
  measurement_id: string
  value: number
  recorded_at: string
  notes?: string
  created_at: string
  updated_at: string
}

// App settings
export interface Settings {
  id: number
  unit_system: 'metric' | 'imperial'
  theme: 'light' | 'dark' | 'system'
  user_age?: number
  updated_at: string
}

// Measurement with its latest entry
export interface MeasurementWithLatest extends Measurement {
  latest_entry?: MeasurementEntry
}

// For forms
export interface MeasurementFormData {
  name: string
  unit_metric: string
  unit_imperial: string
  category: string
}

export interface EntryFormData {
  value: number
  recorded_at: string
  notes?: string
}

// JP3 calculation input
export interface JP3FormData {
  chest_skinfold: number
  abdomen_skinfold: number
  thigh_skinfold: number
  recorded_at: string
}

// Chart data point
export interface ChartDataPoint {
  date: string
  timestamp: number
  [key: string]: string | number | undefined  // Dynamic measurement values
}

// Date range for analytics
export interface DateRange {
  start: Date
  end: Date
}

// Category definitions
export const MEASUREMENT_CATEGORIES = [
  'Body',
  'Upper Body',
  'Core',
  'Lower Body',
  'Arms',
  'Legs',
  'JP3 Skinfold',
  'JP3 Calculated',
] as const

export type MeasurementCategory = typeof MEASUREMENT_CATEGORIES[number]

// Unit conversion helpers
export const UNIT_CONVERSIONS = {
  // kg to lbs
  weight: {
    toImperial: (value: number) => value * 2.20462,
    toMetric: (value: number) => value * 0.453592,
  },
  // cm to inches
  length: {
    toImperial: (value: number) => value * 0.393701,
    toMetric: (value: number) => value * 2.54,
  },
  // No conversion needed
  percentage: {
    toImperial: (value: number) => value,
    toMetric: (value: number) => value,
  },
  // mm stays as mm
  skinfold: {
    toImperial: (value: number) => value,
    toMetric: (value: number) => value,
  },
}
