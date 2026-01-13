import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { MeasurementEntry, EntryFormData } from '@/types'

export function useEntries(measurementId?: string) {
  const [entries, setEntries] = useState<MeasurementEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch entries for a measurement
  const fetchEntries = useCallback(async (id?: string) => {
    const targetId = id || measurementId
    if (!targetId) return

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('measurement_entries')
        .select('*')
        .eq('measurement_id', targetId)
        .order('recorded_at', { ascending: false })

      if (fetchError) throw fetchError

      setEntries(data || [])
    } catch (err) {
      console.error('Error fetching entries:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch entries')
    } finally {
      setIsLoading(false)
    }
  }, [measurementId])

  // Add a new entry
  const addEntry = async (measurementId: string, data: EntryFormData): Promise<MeasurementEntry | null> => {
    try {
      setError(null)

      const { data: newEntry, error } = await supabase
        .from('measurement_entries')
        .insert([{
          measurement_id: measurementId,
          value: data.value,
          recorded_at: data.recorded_at,
          notes: data.notes || null,
        }])
        .select()
        .single()

      if (error) throw error

      // Refresh entries
      await fetchEntries(measurementId)
      return newEntry
    } catch (err) {
      console.error('Error adding entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to add entry')
      return null
    }
  }

  // Add multiple entries at once (for JP3)
  const addMultipleEntries = async (
    entriesData: Array<{ measurement_id: string; value: number; recorded_at: string }>
  ): Promise<boolean> => {
    try {
      setError(null)

      const { error } = await supabase
        .from('measurement_entries')
        .insert(entriesData)

      if (error) throw error

      return true
    } catch (err) {
      console.error('Error adding entries:', err)
      setError(err instanceof Error ? err.message : 'Failed to add entries')
      return false
    }
  }

  // Update an entry
  const updateEntry = async (entryId: string, data: Partial<EntryFormData>): Promise<boolean> => {
    try {
      setError(null)

      const { error } = await supabase
        .from('measurement_entries')
        .update({
          value: data.value,
          recorded_at: data.recorded_at,
          notes: data.notes,
        })
        .eq('id', entryId)

      if (error) throw error

      // Refresh entries
      if (measurementId) await fetchEntries()
      return true
    } catch (err) {
      console.error('Error updating entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to update entry')
      return false
    }
  }

  // Delete an entry
  const deleteEntry = async (entryId: string): Promise<boolean> => {
    try {
      setError(null)

      const { error } = await supabase
        .from('measurement_entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error

      // Refresh entries
      if (measurementId) await fetchEntries()
      return true
    } catch (err) {
      console.error('Error deleting entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete entry')
      return false
    }
  }

  return {
    entries,
    isLoading,
    error,
    fetchEntries,
    addEntry,
    addMultipleEntries,
    updateEntry,
    deleteEntry,
  }
}
