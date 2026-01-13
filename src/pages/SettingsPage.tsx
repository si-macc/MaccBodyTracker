import { useState } from 'react'
import { useSettings } from '@/contexts/SettingsContext'
import { useTheme } from '@/contexts/ThemeContext'
import { supabase } from '@/lib/supabase'
import Card from '@/components/common/Card'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { Moon, Sun, Monitor, Download, FileJson, FileSpreadsheet } from 'lucide-react'
import { format } from 'date-fns'

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const { theme, setTheme } = useTheme()
  const [isExporting, setIsExporting] = useState(false)

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = e.target.value ? parseInt(e.target.value, 10) : undefined
    updateSettings({ user_age: age })
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportAsJSON = async () => {
    setIsExporting(true)
    try {
      // Fetch all data
      const [measurementsRes, entriesRes, settingsRes] = await Promise.all([
        supabase.from('measurements').select('*').order('name'),
        supabase.from('measurement_entries').select('*').order('recorded_at', { ascending: false }),
        supabase.from('settings').select('*').limit(1)
      ])

      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '0.1.0',
        measurements: measurementsRes.data || [],
        entries: entriesRes.data || [],
        settings: settingsRes.data?.[0] || null
      }

      const filename = `measureme-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`
      downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json')
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsCSV = async () => {
    setIsExporting(true)
    try {
      // Fetch entries with measurement names
      const { data: entries } = await supabase
        .from('measurement_entries')
        .select('*, measurements(name, unit_metric)')
        .order('recorded_at', { ascending: false })

      if (!entries?.length) {
        alert('No entries to export.')
        setIsExporting(false)
        return
      }

      // Build CSV
      const headers = ['Date', 'Time', 'Measurement', 'Value', 'Unit', 'Notes']
      const rows = entries.map(entry => {
        const date = new Date(entry.recorded_at)
        const measurement = entry.measurements as { name: string; unit_metric: string } | null
        return [
          format(date, 'yyyy-MM-dd'),
          format(date, 'HH:mm:ss'),
          measurement?.name || 'Unknown',
          entry.value.toString(),
          measurement?.unit_metric || '',
          entry.notes || ''
        ].map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
      })

      const csv = [headers.join(','), ...rows].join('\n')
      const filename = `measureme-entries-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`
      downloadFile(csv, filename, 'text/csv')
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
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

      {/* Data Export */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Export Data
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Download a backup of all your measurements and entries
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={exportAsJSON}
            disabled={isExporting}
            variant="secondary"
            className="flex-1"
          >
            <FileJson className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export as JSON'}
          </Button>
          <Button
            onClick={exportAsCSV}
            disabled={isExporting}
            variant="secondary"
            className="flex-1"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export as CSV'}
          </Button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
          JSON includes full backup (measurements, entries, settings). CSV exports entries only for spreadsheet use.
        </p>
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
