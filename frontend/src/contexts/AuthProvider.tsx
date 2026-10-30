import { useState, useEffect, useCallback, type ReactNode } from 'react'
import api from '@/services/api'
import { AuthContext, type User } from './AuthContext'

function getInitialToken(): string | null {
  return localStorage.getItem('token')
}

function getInitialUser(): User | null {
  const stored = localStorage.getItem('user')
  if (!stored) return null
  try {
    return JSON.parse(stored) as User
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser)
  const [token, setToken] = useState<string | null>(getInitialToken)
  const [isLoading, setIsLoading] = useState(() => Boolean(getInitialToken() && !getInitialUser()))

  useEffect(() => {
    if (!token || user) return
    api.get('/me')
      .then((res) => {
        setUser(res.data)
        localStorage.setItem('user', JSON.stringify(res.data))
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [token, user])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/login', { email, password })
    const { access_token, user: userData } = res.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(access_token)
    setUser(userData)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post('/register', { name, email, password })
    const { access_token, user: userData } = res.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(access_token)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
