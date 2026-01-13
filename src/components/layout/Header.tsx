import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-5 h-5" />
    }
    return resolvedTheme === 'dark' ? (
      <Moon className="w-5 h-5" />
    ) : (
      <Sun className="w-5 h-5" />
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-700 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              MeasureMe
            </h1>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={cycleTheme}
            className="btn-ghost btn-icon"
            aria-label={`Current theme: ${theme}. Click to change.`}
            title={`Theme: ${theme}`}
          >
            {getThemeIcon()}
          </button>
        </div>
      </div>
    </header>
  )
}
