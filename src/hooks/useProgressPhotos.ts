import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProgressPhoto, MeasurementSnapshot, MeasurementWithLatest } from '@/types'

export function useProgressPhotos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPhotos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('progress_photos')
        .select('*')
        .order('taken_at', { ascending: false })

      if (fetchError) throw fetchError

      // Generate signed URLs for private bucket (1 hour expiry)
      const photosWithUrls = await Promise.all(
        (data || []).map(async (photo) => {
          const { data: signedData, error: signError } = await supabase.storage
            .from('progress-photos')
            .createSignedUrl(photo.image_path, 3600)

          return {
            ...photo,
            image_url: signError ? photo.image_url : signedData.signedUrl,
          }
        })
      )

      setPhotos(photosWithUrls)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch photos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const buildSnapshot = (measurements: MeasurementWithLatest[]): MeasurementSnapshot[] => {
    return measurements
      .filter(m => m.latest_entry && !m.is_calculated)
      .map(m => ({
        name: m.name,
        value: m.latest_entry!.value,
        unit_metric: m.unit_metric,
        unit_imperial: m.unit_imperial,
        recorded_at: m.latest_entry!.recorded_at,
      }))
  }

  const uploadPhotos = useCallback(async (
    files: File[],
    measurements: MeasurementWithLatest[],
    caption?: string
  ) => {
    setIsUploading(true)
    setError(null)
    const snapshot = buildSnapshot(measurements)

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `photos/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('progress-photos')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Insert record (image_url stored as path reference, signed URLs generated on fetch)
        const { error: insertError } = await supabase
          .from('progress_photos')
          .insert({
            image_path: filePath,
            image_url: filePath,
            caption: caption || null,
            measurement_snapshot: snapshot,
            taken_at: new Date().toISOString(),
          })

        if (insertError) throw insertError
      }

      await fetchPhotos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setIsUploading(false)
    }
  }, [fetchPhotos])

  const deletePhoto = useCallback(async (id: string, imagePath: string) => {
    setError(null)
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('progress-photos')
        .remove([imagePath])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError

      setPhotos(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo')
    }
  }, [])

  return { photos, isLoading, isUploading, error, fetchPhotos, uploadPhotos, deletePhoto }
}
