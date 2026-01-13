import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import MeasurementsPage from './pages/MeasurementsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/measurements" replace />} />
        <Route path="/measurements" element={<MeasurementsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  )
}

export default App
