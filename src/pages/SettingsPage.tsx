import { useSettings } from '@/contexts/SettingsContext'
import { useTheme } from '@/contexts/ThemeContext'
import Card from '@/components/common/Card'
import Input from '@/components/common/Input'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const { theme, setTheme } = useTheme()

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = e.target.value ? parseInt(e.target.value, 10) : undefined
    updateSettings({ user_age: age })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your app preferences
        </p>
      </div>

      {/* Unit System */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Unit System
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => updateSettings({ unit_system: 'metric' })}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              settings.unit_system === 'metric'
                ? 'bg-primary-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Metric
            <span className="block text-xs mt-0.5 opacity-75">kg, cm</span>
          </button>
          <button
            onClick={() => updateSettings({ unit_system: 'imperial' })}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              settings.unit_system === 'imperial'
                ? 'bg-primary-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Imperial
            <span className="block text-xs mt-0.5 opacity-75">lbs, in</span>
          </button>
        </div>
      </Card>

      {/* Theme */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Theme
        </h3>
        <div className="flex gap-2">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
                theme === value
                  ? 'bg-primary-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Age (for JP3 calculation) */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Your Age
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Required for Jackson-Pollock body fat calculation
        </p>
        <Input
          type="number"
          min="10"
          max="100"
          value={settings.user_age || ''}
          onChange={handleAgeChange}
          placeholder="Enter your age"
        />
      </Card>

      {/* App Info */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          About MeasureMe
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Version 0.1.0
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track your body measurements and visualize your progress over time.
        </p>
      </Card>
    </div>
  )
}
