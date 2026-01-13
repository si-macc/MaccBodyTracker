import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { supabase } from '@/lib/supabase'
import { useSettings } from '@/contexts/SettingsContext'
import { useEntries } from '@/hooks/useEntries'
import { formatDateTimeLocal, calculateJP3BodyFat } from '@/lib/utils'

interface JP3FormModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function JP3FormModal({ isOpen, onClose, onComplete }: JP3FormModalProps) {
  const { settings } = useSettings()
  const { addMultipleEntries } = useEntries()
  
  const [chestSkinfold, setChestSkinfold] = useState('')
  const [abdomenSkinfold, setAbdomenSkinfold] = useState('')
  const [thighSkinfold, setThighSkinfold] = useState('')
  const [recordedAt, setRecordedAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculatedBF, setCalculatedBF] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setChestSkinfold('')
      setAbdomenSkinfold('')
      setThighSkinfold('')
      setRecordedAt(formatDateTimeLocal(new Date()))
      setCalculatedBF(null)
      setError(null)
    }
  }, [isOpen])

  // Calculate body fat when values change
  useEffect(() => {
    const chest = parseFloat(chestSkinfold)
    const abdomen = parseFloat(abdomenSkinfold)
    const thigh = parseFloat(thighSkinfold)
    const age = settings.user_age

    if (!isNaN(chest) && !isNaN(abdomen) && !isNaN(thigh) && age) {
      const bf = calculateJP3BodyFat(chest, abdomen, thigh, age)
      setCalculatedBF(bf)
    } else {
      setCalculatedBF(null)
    }
  }, [chestSkinfold, abdomenSkinfold, thighSkinfold, settings.user_age])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!settings.user_age) {
      setError('Please set your age in Settings first')
      return
    }

    const chest = parseFloat(chestSkinfold)
    const abdomen = parseFloat(abdomenSkinfold)
    const thigh = parseFloat(thighSkinfold)

    if (isNaN(chest) || isNaN(abdomen) || isNaN(thigh)) {
      setError('Please enter valid values for all skinfold measurements')
      return
    }

    setIsSubmitting(true)

    try {
      // Fetch the measurement IDs for the skinfold measurements and calculated result
      const { data: measurements, error: fetchError } = await supabase
        .from('measurements')
        .select('id, name')
        .in('name', ['Chest Skinfold', 'Abdomen Skinfold', 'Thigh Skinfold', 'JP3 Body Fat %'])

      if (fetchError) throw fetchError
      if (!measurements || measurements.length < 4) {
        throw new Error('Could not find JP3 measurements. Please ensure default measurements are seeded.')
      }

      // Map measurements to IDs
      const measurementMap = measurements.reduce((acc, m) => {
        acc[m.name] = m.id
        return acc
      }, {} as Record<string, string>)

      const recordedAtISO = new Date(recordedAt).toISOString()
      const bodyFat = calculateJP3BodyFat(chest, abdomen, thigh, settings.user_age)

      // Create all entries with the same timestamp
      const entries = [
        { measurement_id: measurementMap['Chest Skinfold'], value: chest, recorded_at: recordedAtISO },
        { measurement_id: measurementMap['Abdomen Skinfold'], value: abdomen, recorded_at: recordedAtISO },
        { measurement_id: measurementMap['Thigh Skinfold'], value: thigh, recorded_at: recordedAtISO },
        { measurement_id: measurementMap['JP3 Body Fat %'], value: parseFloat(bodyFat.toFixed(2)), recorded_at: recordedAtISO },
      ]

      const success = await addMultipleEntries(entries)

      if (success) {
        onComplete()
      } else {
        throw new Error('Failed to save entries')
      }
    } catch (err) {
      console.error('Error saving JP3 entries:', err)
      setError(err instanceof Error ? err.message : 'Failed to save measurements')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Calculate JP3 Body Fat %" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Age Warning */}
        {!settings.user_age && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              ⚠️ You need to set your age in Settings before calculating body fat.
            </p>
          </div>
        )}

        {/* Skinfold Inputs */}
        <div className="space-y-3">
          <div>
            <Input
              label="Chest Skinfold (mm)"
              type="number"
              step="0.1"
              value={chestSkinfold}
              onChange={(e) => setChestSkinfold(e.target.value)}
              placeholder="e.g., 12.5"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Diagonal fold halfway between nipple and armpit crease
            </p>
          </div>

          <div>
            <Input
              label="Abdomen Skinfold (mm)"
              type="number"
              step="0.1"
              value={abdomenSkinfold}
              onChange={(e) => setAbdomenSkinfold(e.target.value)}
              placeholder="e.g., 18.0"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Vertical fold 2cm to the right of the navel
            </p>
          </div>

          <div>
            <Input
              label="Thigh Skinfold (mm)"
              type="number"
              step="0.1"
              value={thighSkinfold}
              onChange={(e) => setThighSkinfold(e.target.value)}
              placeholder="e.g., 15.0"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Vertical fold on front of thigh, midway between hip and knee
            </p>
          </div>
        </div>

        {/* Calculated Result Preview */}
        {calculatedBF !== null && (
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg text-center">
            <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">
              Calculated Body Fat %
            </p>
            <p className="text-3xl font-bold text-primary-700 dark:text-primary-300">
              {calculatedBF.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Using age: {settings.user_age} years
            </p>
          </div>
        )}

        {/* Date/Time */}
        <div>
          <label className="label">Date & Time</label>
          <Input
            type="datetime-local"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            required
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !settings.user_age || calculatedBF === null}
            className="flex-1"
          >
            {isSubmitting ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
