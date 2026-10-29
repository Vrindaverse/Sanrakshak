import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { AuthProvider } from '@/contexts/AuthProvider'
import { useAuth } from '@/contexts/useAuth'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import NewScan from '@/pages/NewScan'
import ScanResults from '@/pages/ScanResults'
import Dashboard from '@/pages/Dashboard'
import Home from '@/pages/Home'
import { AnimatedPage } from '@/components/AnimatedPage'
import { type ReactNode } from 'react'
import { EASE_OUT_SOFT } from '@/lib/motion'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth()
  if (isLoading) return null
  if (!token) return <Navigate to="/login" replace />
  return <MainLayout><AnimatedPage>{children}</AnimatedPage></MainLayout>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth()
  if (isLoading) return null
  if (token) return <Navigate to="/scan/new" replace />
  return <AuthLayout><AnimatedPage>{children}</AnimatedPage></AuthLayout>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MotionConfig reducedMotion="user" transition={{ duration: 0.45, ease: EASE_OUT_SOFT }}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/scan/new" element={<ProtectedRoute><NewScan /></ProtectedRoute>} />
          <Route path="/scan/:id" element={<ProtectedRoute><ScanResults /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MotionConfig>
      </AuthProvider>
    </BrowserRouter>
  )
}
