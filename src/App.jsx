import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from './pages/public/PublicLayout'
import { StartScreen } from './pages/public/StartScreen'
import { PersonalDataStep } from './pages/public/PersonalDataStep'
import { AddressStep } from './pages/public/AddressStep'
import { SpecialConditionsStep } from './pages/public/SpecialConditionsStep'
import { ReviewStep } from './pages/public/ReviewStep'

import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminLayout } from './pages/admin/AdminLayout'
import { Dashboard } from './pages/admin/Dashboard'
import { SubscriberList } from './pages/admin/SubscriberList'
import { UserManagement } from './pages/admin/UserManagement'
import { Settings } from './pages/admin/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<StartScreen />} />
          <Route path="inscricao/dados-pessoais" element={<PersonalDataStep />} />
          <Route path="inscricao/endereco" element={<AddressStep />} />
          <Route path="inscricao/condicoes-especiais" element={<SpecialConditionsStep />} />
          <Route path="inscricao/revisao" element={<ReviewStep />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inscritos" element={<SubscriberList />} />
          <Route path="usuarios" element={<UserManagement />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
