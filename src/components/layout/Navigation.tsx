import { NavLink } from 'react-router-dom'
import { Ruler, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { path: '/measurements', label: 'Measurements', icon: Ruler },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Navigation() {
  return (
    <nav className="sticky bottom-0 z-50 bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-700 pb-safe">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'text-primary-700 dark:text-primary-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
