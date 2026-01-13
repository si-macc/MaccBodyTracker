import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Settings } from '@/types'

interface SettingsContextType {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => Promise<void>
  isLoading: boolean
}

const defaultSettings: Settings = {
  id: 1,
  unit_system: 'metric',
  theme: 'system',
  user_age: undefined,
  updated_at: new Date().toISOString(),
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single()

        if (error) {
          // If no settings exist, create default
          if (error.code === 'PGRST116') {
            const { data: newSettings } = await supabase
              .from('settings')
              .insert([defaultSettings])
              .select()
              .single()
            
            if (newSettings) {
              setSettings(newSettings)
            }
          } else {
            console.error('Error loading settings:', error)
          }
        } else if (data) {
          setSettings(data)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
        // Use localStorage fallback
        const stored = localStorage.getItem('settings')
        if (stored) {
          setSettings(JSON.parse(stored))
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Update settings
  const updateSettings = async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates, updated_at: new Date().toISOString() }
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert(newSettings)
        .eq('id', 1)

      if (error) {
        console.error('Error saving settings:', error)
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
    
    // Update local state regardless
    setSettings(newSettings)
    localStorage.setItem('settings', JSON.stringify(newSettings))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
