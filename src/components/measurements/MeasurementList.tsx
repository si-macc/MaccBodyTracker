import { useState } from 'react'
import { Plus, Ruler } from 'lucide-react'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'
import Loading from '@/components/common/Loading'
import MeasurementCard from './MeasurementCard'
import MeasurementFormModal from './MeasurementFormModal'
import MeasurementDetailModal from './MeasurementDetailModal'
import type { MeasurementWithLatest, MeasurementFormData } from '@/types'

interface MeasurementListProps {
  measurements: MeasurementWithLatest[]
  isLoading: boolean
  error: string | null
  onAddMeasurement: (data: MeasurementFormData) => Promise<unknown>
  onUpdateMeasurement: (id: string, data: Partial<MeasurementFormData>) => Promise<boolean>
  onDeleteMeasurement: (id: string) => Promise<boolean>
  onRefresh: () => void
}

export default function MeasurementList({
  measurements,
  isLoading,
  error,
  onAddMeasurement,
  onUpdateMeasurement,
  onDeleteMeasurement,
  onRefresh,
}: MeasurementListProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementWithLatest | null>(null)
  const [editingMeasurement, setEditingMeasurement] = useState<MeasurementWithLatest | null>(null)

  // Group measurements by category
  const groupedMeasurements = measurements.reduce((acc, measurement) => {
    const category = measurement.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(measurement)
    return acc
  }, {} as Record<string, MeasurementWithLatest[]>)

  // Sort categories
  const categoryOrder = ['Body', 'Upper Body', 'Core', 'Lower Body', 'Arms', 'Legs', 'JP3 Skinfold', 'JP3 Calculated', 'Other']
  const sortedCategories = Object.keys(groupedMeasurements).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a)
    const bIndex = categoryOrder.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  const handleAddSubmit = async (data: MeasurementFormData) => {
    await onAddMeasurement(data)
    setShowAddModal(false)
  }

  const handleEditSubmit = async (data: MeasurementFormData) => {
    if (editingMeasurement) {
      await onUpdateMeasurement(editingMeasurement.id, data)
      setEditingMeasurement(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this measurement? All associated data will be lost.')) {
      await onDeleteMeasurement(id)
      setEditingMeasurement(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={onRefresh} variant="secondary">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Measurements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your body measurements over time
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Content */}
      {measurements.length === 0 ? (
        <EmptyState
          icon={<Ruler className="w-8 h-8" />}
          title="No measurements yet"
          description="Add your first measurement to start tracking your progress"
          action={
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" />
              Add Measurement
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {sortedCategories.map((category) => (
            <div key={category}>
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
                {category}
              </h2>
              <div className="space-y-2">
                {groupedMeasurements[category].map((measurement) => (
                  <MeasurementCard
                    key={measurement.id}
                    measurement={measurement}
                    onClick={() => setSelectedMeasurement(measurement)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Measurement Modal */}
      <MeasurementFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        title="Add Measurement"
      />

      {/* Edit Measurement Modal */}
      <MeasurementFormModal
        isOpen={!!editingMeasurement}
        onClose={() => setEditingMeasurement(null)}
        onSubmit={handleEditSubmit}
        onDelete={() => editingMeasurement && handleDelete(editingMeasurement.id)}
        title="Edit Measurement"
        initialData={editingMeasurement ? {
          name: editingMeasurement.name,
          unit_metric: editingMeasurement.unit_metric,
          unit_imperial: editingMeasurement.unit_imperial,
          category: editingMeasurement.category,
        } : undefined}
        isDefault={editingMeasurement?.is_default}
      />

      {/* Measurement Detail Modal */}
      <MeasurementDetailModal
        isOpen={!!selectedMeasurement}
        onClose={() => setSelectedMeasurement(null)}
        measurement={selectedMeasurement}
        onEdit={() => {
          setEditingMeasurement(selectedMeasurement)
          setSelectedMeasurement(null)
        }}
        onRefresh={onRefresh}
      />
    </div>
  )
}
