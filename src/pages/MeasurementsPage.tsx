import { MeasurementList } from '@/components/measurements'
import { useMeasurements } from '@/hooks/useMeasurements'

export default function MeasurementsPage() {
  const {
    measurements,
    isLoading,
    error,
    refetch,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
  } = useMeasurements()

  return (
    <MeasurementList
      measurements={measurements}
      isLoading={isLoading}
      error={error}
      onAddMeasurement={addMeasurement}
      onUpdateMeasurement={updateMeasurement}
      onDeleteMeasurement={deleteMeasurement}
      onRefresh={refetch}
    />
  )
}
