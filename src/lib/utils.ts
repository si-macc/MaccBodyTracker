import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display
export function formatDate(dateString: string, formatStr: string = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateString), formatStr)
  } catch {
    return dateString
  }
}

// Format date with time
export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a')
  } catch {
    return dateString
  }
}

// Format date for input[type="datetime-local"]
export function formatDateTimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

// Format value with unit
export function formatValue(value: number, unit: string, decimals: number = 1): string {
  return `${value.toFixed(decimals)} ${unit}`
}

// Calculate Jackson-Pollock 3-Site Body Fat % (Male)
export function calculateJP3BodyFat(
  chestSkinfold: number,
  abdomenSkinfold: number,
  thighSkinfold: number,
  age: number
): number {
  const sum = chestSkinfold + abdomenSkinfold + thighSkinfold
  
  // Body Density formula for males
  const bodyDensity = 
    1.10938 - 
    (0.0008267 * sum) + 
    (0.0000016 * sum * sum) - 
    (0.0002574 * age)
  
  // Siri equation to convert body density to body fat percentage
  const bodyFatPercentage = (495 / bodyDensity) - 450
  
  // Clamp to reasonable range (0-60%)
  return Math.max(0, Math.min(60, bodyFatPercentage))
}

// Generate a UUID (for client-side use)
export function generateId(): string {
  return crypto.randomUUID()
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Check if device is in landscape mode
export function isLandscape(): boolean {
  return window.innerWidth > window.innerHeight
}

// Get color for chart line based on index
export function getChartColor(index: number): string {
  const colors = [
    '#3B5B7A', // Primary sharky blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
  ]
  return colors[index % colors.length]
}

// Convert value from metric to imperial for display
export function convertUnit(
  value: number,
  unitMetric: string,
  toSystem: 'metric' | 'imperial'
): number {
  if (toSystem === 'metric') return value // Already stored in metric
  
  // Convert to imperial based on unit type
  if (unitMetric === 'kg') {
    return value * 2.20462 // kg to lbs
  } else if (unitMetric === 'cm') {
    return value * 0.393701 // cm to inches
  }
  
  // No conversion for %, mm, etc.
  return value
}

// Convert value from imperial to metric for storage
export function convertToMetric(
  value: number,
  unitMetric: string,
  fromSystem: 'metric' | 'imperial'
): number {
  if (fromSystem === 'metric') return value // Already in metric
  
  // Convert from imperial to metric based on unit type
  if (unitMetric === 'kg') {
    return value * 0.453592 // lbs to kg
  } else if (unitMetric === 'cm') {
    return value * 2.54 // inches to cm
  }
  
  // No conversion for %, mm, etc.
  return value
}

// Get display unit based on system preference
export function getDisplayUnit(
  unitMetric: string,
  unitImperial: string,
  system: 'metric' | 'imperial'
): string {
  return system === 'metric' ? unitMetric : unitImperial
}
