import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Measurement, MeasurementWithLatest, MeasurementFormData } from '@/types'

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<MeasurementWithLatest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all measurements with their latest entry
  const fetchMeasurements = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get all measurements
      const { data: measurementsData, error: measurementsError } = await supabase
        .from('measurements')
        .select('*')
        .order('sort_order', { ascending: true })

      if (measurementsError) throw measurementsError

      // Get latest entry for each measurement
      const measurementsWithLatest: MeasurementWithLatest[] = await Promise.all(
        (measurementsData || []).map(async (measurement) => {
          const { data: latestEntry } = await supabase
            .from('measurement_entries')
            .select('*')
            .eq('measurement_id', measurement.id)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...measurement,
            latest_entry: latestEntry || undefined,
          }
        })
      )

      setMeasurements(measurementsWithLatest)
    } catch (err) {
      console.error('Error fetching measurements:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch measurements')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Add a new measurement type
  const addMeasurement = async (data: MeasurementFormData): Promise<Measurement | null> => {
    try {
      setError(null)
      
      // Get the highest sort_order
      const maxSortOrder = measurements.reduce((max, m) => Math.max(max, m.sort_order), 0)

      const { data: newMeasurement, error } = await supabase
        .from('measurements')
        .insert([{
          ...data,
          sort_order: maxSortOrder + 1,
          is_default: false,
          is_calculated: false,
        }])
        .select()
        .single()

      if (error) throw error

      // Refresh the list
      await fetchMeasurements()
      return newMeasurement
    } catch (err) {
      console.error('Error adding measurement:', err)
      setError(err instanceof Error ? err.message : 'Failed to add measurement')
      return null
    }
  }

  // Update a measurement type
  const updateMeasurement = async (id: string, data: Partial<MeasurementFormData>): Promise<boolean> => {
    try {
      setError(null)

      const { error } = await supabase
        .from('measurements')
        .update(data)
        .eq('id', id)

      if (error) throw error

      // Refresh the list
      await fetchMeasurements()
      return true
    } catch (err) {
      console.error('Error updating measurement:', err)
      setError(err instanceof Error ? err.message : 'Failed to update measurement')
      return false
    }
  }

  // Delete a measurement type
  const deleteMeasurement = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      const { error } = await supabase
        .from('measurements')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Refresh the list
      await fetchMeasurements()
      return true
    } catch (err) {
      console.error('Error deleting measurement:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete measurement')
      return false
    }
  }

  // Load measurements on mount
  useEffect(() => {
    fetchMeasurements()
  }, [fetchMeasurements])

  return {
    measurements,
    isLoading,
    error,
    refetch: fetchMeasurements,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
  }
}
