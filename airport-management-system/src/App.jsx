import './App.css'
import './components/login.css'
import './components/navBar.css'
import './components/admin.css'
import { Login } from './components/login'
import { Admin } from './components/admin'
import { Worker } from './components/worker'

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider >
        <Routes>
          
          <Route path='/' element={<Login />} />
          
          <Route
            path='/admin'
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
          
          <Route
            path='/worker'
            element={
              <ProtectedRoute allowedRoles={['technician', 'pilot']}>
                <Worker />
              </ProtectedRoute>
            }
          />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
