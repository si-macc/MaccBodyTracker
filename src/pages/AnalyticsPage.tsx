import { BarChart3 } from 'lucide-react'
import Card from '@/components/common/Card'
import EmptyState from '@/components/common/EmptyState'

export default function AnalyticsPage() {
  // TODO: Replace with actual data
  const hasData = false

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Visualize your progress over time
        </p>
      </div>

      {/* Chart Area */}
      <Card className="p-4">
        {hasData ? (
          <div className="h-64 md:h-80 flex items-center justify-center">
            {/* Chart will go here in Phase 4 */}
            <p className="text-slate-500">Chart coming in Phase 4...</p>
          </div>
        ) : (
          <EmptyState
            icon={<BarChart3 className="w-8 h-8" />}
            title="No data to display"
            description="Start logging measurements to see your progress visualized here"
          />
        )}
      </Card>

      {/* Date Range Picker - Placeholder */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Date Range
        </h3>
        <p className="text-sm text-slate-500">Date range picker coming in Phase 4...</p>
      </Card>

      {/* Measurement Filters - Placeholder */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Measurements
        </h3>
        <p className="text-sm text-slate-500">Measurement filters coming in Phase 4...</p>
      </Card>
    </div>
  )
}
