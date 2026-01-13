import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { formatDateTimeLocal } from '@/lib/utils'

interface EntryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { value: number; recorded_at: string; notes?: string }) => Promise<void>
  title: string
  unit: string
  initialData?: {
    value: number
    recorded_at: string
    notes?: string
  }
}

export default function EntryFormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  unit,
  initialData,
}: EntryFormModalProps) {
  const [value, setValue] = useState('')
  const [recordedAt, setRecordedAt] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue(initialData.value.toString())
        setRecordedAt(formatDateTimeLocal(new Date(initialData.recorded_at)))
        setNotes(initialData.notes || '')
      } else {
        setValue('')
        setRecordedAt(formatDateTimeLocal(new Date()))
        setNotes('')
      }
    }
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        value: numValue,
        recorded_at: new Date(recordedAt).toISOString(),
        notes: notes.trim() || undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Value */}
        <div>
          <label className="label">Value ({unit})</label>
          <Input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter value in ${unit}`}
            required
            autoFocus
          />
        </div>

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

        {/* Notes */}
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes..."
            className="input min-h-[80px] resize-none"
          />
        </div>

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
            disabled={isSubmitting || !value}
            className="flex-1"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
