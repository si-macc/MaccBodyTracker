import { TrendingDown, TrendingUp, Minus, LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  unit?: string
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  iconColor?: string
}

export default function StatsCard({
  title,
  value,
  unit,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-primary-600'
}: StatsCardProps) {
  const TrendIcon = change === undefined 
    ? null 
    : change < 0 
      ? TrendingDown 
      : change > 0 
        ? TrendingUp 
        : Minus

  const trendColor = change === undefined
    ? ''
    : change < 0
      ? 'text-green-600 dark:text-green-400'
      : change > 0
        ? 'text-red-600 dark:text-red-400'
        : 'text-slate-500'

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        {Icon && (
          <div className={`p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        {unit && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {change !== undefined && TrendIcon && (
        <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {change > 0 ? '+' : ''}{change.toFixed(1)}
            {changeLabel && <span className="text-slate-400 ml-1">{changeLabel}</span>}
          </span>
        </div>
      )}
    </div>
  )
}
