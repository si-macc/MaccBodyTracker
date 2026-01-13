import { Plus, Ruler } from 'lucide-react'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'

export default function MeasurementsPage() {
  // TODO: Replace with actual data from useMeasurements hook
  const measurements: unknown[] = []
  const isLoading = false

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-primary-200 border-t-primary-700 animate-spin" />
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
        <Button>
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
            <Button>
              <Plus className="w-4 h-4" />
              Add Measurement
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {/* Measurement cards will go here */}
          <p className="text-slate-500">Measurements list coming in Phase 2...</p>
        </div>
      )}
    </div>
  )
}
