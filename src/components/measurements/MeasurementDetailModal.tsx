import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Calculator } from 'lucide-react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import EmptyState from '@/components/common/EmptyState'
import Loading from '@/components/common/Loading'
import EntryFormModal from './EntryFormModal'
import JP3FormModal from './JP3FormModal'
import { useEntries } from '@/hooks/useEntries'
import { useSettings } from '@/contexts/SettingsContext'
import { formatDateTime, formatValue, convertUnit, getDisplayUnit } from '@/lib/utils'
import type { MeasurementWithLatest, MeasurementEntry } from '@/types'

interface MeasurementDetailModalProps {
  isOpen: boolean
  onClose: () => void
  measurement: MeasurementWithLatest | null
  onEdit: () => void
  onRefresh: () => void
}

export default function MeasurementDetailModal({
  isOpen,
  onClose,
  measurement,
  onEdit,
  onRefresh,
}: MeasurementDetailModalProps) {
  const { settings } = useSettings()
  const { entries, isLoading, fetchEntries, addEntry, updateEntry, deleteEntry } = useEntries()
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [showJP3Form, setShowJP3Form] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MeasurementEntry | null>(null)

  useEffect(() => {
    if (isOpen && measurement) {
      fetchEntries(measurement.id)
    }
  }, [isOpen, measurement, fetchEntries])

  if (!measurement) return null

  const displayUnit = getDisplayUnit(
    measurement.unit_metric,
    measurement.unit_imperial,
    settings.unit_system
  )

  const isJP3Calculated = measurement.category === 'JP3 Calculated'

  const handleAddEntry = async (data: { value: number; recorded_at: string; notes?: string }) => {
    await addEntry(measurement.id, data)
    setShowAddEntry(false)
    onRefresh()
  }

  const handleUpdateEntry = async (data: { value: number; recorded_at: string; notes?: string }) => {
    if (editingEntry) {
      await updateEntry(editingEntry.id, data)
      setEditingEntry(null)
      onRefresh()
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (confirm('Delete this entry?')) {
      await deleteEntry(entryId)
      onRefresh()
    }
  }

  const handleJP3Complete = () => {
    setShowJP3Form(false)
    fetchEntries(measurement.id)
    onRefresh()
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={measurement.name} size="lg">
        <div className="space-y-4">
          {/* Header info */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                {measurement.category}
              </span>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Unit: {displayUnit}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
              Edit Type
            </Button>
          </div>

          {/* Add Entry Button */}
          <div className="flex gap-2">
            {isJP3Calculated ? (
              <Button onClick={() => setShowJP3Form(true)} className="flex-1">
                <Calculator className="w-4 h-4" />
                Calculate JP3 Body Fat
              </Button>
            ) : (
              <Button onClick={() => setShowAddEntry(true)} className="flex-1">
                <Plus className="w-4 h-4" />
                Add Entry
              </Button>
            )}
          </div>

          {isJP3Calculated && (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              This measurement is auto-calculated from skinfold measurements
            </p>
          )}

          {/* Entries List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="py-8">
                <Loading />
              </div>
            ) : entries.length === 0 ? (
              <EmptyState
                icon={<Plus className="w-6 h-6" />}
                title="No entries yet"
                description={isJP3Calculated 
                  ? "Calculate your first JP3 body fat measurement"
                  : "Add your first measurement entry"
                }
              />
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => {
                  const displayValue = convertUnit(
                    entry.value,
                    measurement.unit_metric,
                    settings.unit_system
                  )

                  return (
                    <Card key={entry.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {formatValue(displayValue, displayUnit)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDateTime(entry.recorded_at)}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        {!isJP3Calculated && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingEntry(entry)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Add Entry Modal */}
      <EntryFormModal
        isOpen={showAddEntry}
        onClose={() => setShowAddEntry(false)}
        onSubmit={handleAddEntry}
        title={`Add ${measurement.name}`}
        unit={displayUnit}
        unitMetric={measurement.unit_metric}
      />

      {/* Edit Entry Modal */}
      <EntryFormModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSubmit={handleUpdateEntry}
        title={`Edit ${measurement.name}`}
        unit={displayUnit}
        unitMetric={measurement.unit_metric}
        initialData={editingEntry ? {
          value: convertUnit(editingEntry.value, measurement.unit_metric, settings.unit_system),
          recorded_at: editingEntry.recorded_at,
          notes: editingEntry.notes,
        } : undefined}
      />

      {/* JP3 Calculation Modal */}
      <JP3FormModal
        isOpen={showJP3Form}
        onClose={() => setShowJP3Form(false)}
        onComplete={handleJP3Complete}
      />
    </>
  )
}
