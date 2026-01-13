import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Loading({ size = 'md', className }: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'rounded-full border-primary-200 border-t-primary-700 animate-spin',
          'dark:border-primary-800 dark:border-t-primary-400',
          sizes[size]
        )}
      />
    </div>
  )
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="flex flex-col items-center gap-4">
        <Loading size="lg" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  )
}
