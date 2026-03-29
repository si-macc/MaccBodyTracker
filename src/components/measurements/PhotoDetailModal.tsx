import { Trash2 } from 'lucide-react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { useSettings } from '@/contexts/SettingsContext'
import { formatDateTime, convertUnit, getDisplayUnit, formatValue } from '@/lib/utils'
import type { ProgressPhoto } from '@/types'

interface PhotoDetailModalProps {
  isOpen: boolean
  onClose: () => void
  photo: ProgressPhoto | null
  onDelete: (id: string, imagePath: string) => void
}

export default function PhotoDetailModal({
  isOpen,
  onClose,
  photo,
  onDelete,
}: PhotoDetailModalProps) {
  const { settings } = useSettings()

  if (!photo) return null

  const handleDelete = () => {
    if (confirm('Delete this progress photo?')) {
      onDelete(photo.id, photo.image_path)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Progress Photo" size="lg">
      <div className="space-y-4">
        {/* Photo */}
        <div className="rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={photo.image_url}
            alt={photo.caption || 'Progress photo'}
            className="w-full h-auto max-h-[50vh] object-contain"
          />
        </div>

        {/* Timestamp & Caption */}
        <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {formatDateTime(photo.taken_at)}
          </p>
          {photo.caption && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {photo.caption}
            </p>
          )}
        </div>

        {/* Measurement Snapshot */}
        {photo.measurement_snapshot && photo.measurement_snapshot.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Measurements at time of photo
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {photo.measurement_snapshot.map((snap, i) => {
                const displayUnit = getDisplayUnit(
                  snap.unit_metric,
                  snap.unit_imperial,
                  settings.unit_system
                )
                const displayValue = convertUnit(
                  snap.value,
                  snap.unit_metric,
                  settings.unit_system
                )

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 px-2 rounded bg-slate-50 dark:bg-slate-800/50"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {snap.name}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formatValue(displayValue, displayUnit)}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        {formatDateTime(snap.recorded_at)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Delete */}
        <div className="pt-2">
          <Button variant="ghost" onClick={handleDelete} className="text-red-500 w-full">
            <Trash2 className="w-4 h-4" />
            Delete Photo
          </Button>
        </div>
      </div>
    </Modal>
  )
}
