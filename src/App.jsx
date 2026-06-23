import { Routes, Route, Navigate } from 'react-router-dom'
import { useDB } from '@/hooks/useDB'
import Splash from '@/components/pages/Splash'
import LoginPage from '@/components/pages/LoginPage'
import RegisterPage from '@/components/pages/RegisterPage'

export default function App() {
  useDB()

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/splash" replace />} />
      <Route path="/splash" element={<Splash />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/plans" element={<div className="p-6">Plans Page</div>} />
      <Route path="/setup/step-1" element={<div className="p-6">Setup Step 1</div>} />
      <Route path="/setup/step-2" element={<div className="p-6">Setup Step 2</div>} />
      <Route path="/app" element={<div className="p-6">App Layout</div>}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<div>Home Tab</div>} />
        <Route path="reports" element={<div>Reports Tab</div>} />
        <Route path="inventory" element={<div>Inventory Tab</div>} />
        <Route path="ai" element={<div>AI Tab</div>} />
        <Route path="profile" element={<div>Profile Tab</div>} />
      </Route>
      <Route path="*" element={<div className="p-6">404 Not Found</div>} />
    </Routes>
  )
}
