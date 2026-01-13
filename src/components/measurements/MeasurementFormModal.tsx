import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { MEASUREMENT_CATEGORIES } from '@/types'
import type { MeasurementFormData } from '@/types'

interface MeasurementFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MeasurementFormData) => Promise<void>
  onDelete?: () => void
  title: string
  initialData?: MeasurementFormData
  isDefault?: boolean
}

export default function MeasurementFormModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  title,
  initialData,
  isDefault = false,
}: MeasurementFormModalProps) {
  const [formData, setFormData] = useState<MeasurementFormData>({
    name: '',
    unit_metric: 'cm',
    unit_imperial: 'in',
    category: 'Body',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        name: '',
        unit_metric: 'cm',
        unit_imperial: 'in',
        category: 'Body',
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof MeasurementFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Common unit presets
  const unitPresets = [
    { metric: 'cm', imperial: 'in', label: 'Length (cm/in)' },
    { metric: 'kg', imperial: 'lbs', label: 'Weight (kg/lbs)' },
    { metric: '%', imperial: '%', label: 'Percentage' },
    { metric: 'mm', imperial: 'mm', label: 'Skinfold (mm)' },
  ]

  const handleUnitPreset = (preset: typeof unitPresets[0]) => {
    setFormData(prev => ({
      ...prev,
      unit_metric: preset.metric,
      unit_imperial: preset.imperial,
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <Input
          label="Measurement Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Forearm"
          required
          disabled={isDefault}
        />

        {isDefault && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Default measurements cannot be renamed
          </p>
        )}

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="input"
          >
            {MEASUREMENT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Unit Presets */}
        <div>
          <label className="label">Unit Type</label>
          <div className="flex flex-wrap gap-2">
            {unitPresets.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleUnitPreset(preset)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  formData.unit_metric === preset.metric && formData.unit_imperial === preset.imperial
                    ? 'bg-primary-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Units */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Metric Unit"
            value={formData.unit_metric}
            onChange={(e) => handleChange('unit_metric', e.target.value)}
            placeholder="cm"
          />
          <Input
            label="Imperial Unit"
            value={formData.unit_imperial}
            onChange={(e) => handleChange('unit_imperial', e.target.value)}
            placeholder="in"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onDelete && !isDefault && (
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              disabled={isSubmitting}
            >
              Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
