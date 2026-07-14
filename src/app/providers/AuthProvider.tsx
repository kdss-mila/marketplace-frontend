import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setAuthToken } from '@/lib/axios'
import type { User } from '@/types'
import { loginRequest, registerRequest, meRequest } from '@/features/auth/api/authApi'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; name: string; cpf: string; password: string }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const STORAGE_KEY = 'marketplace_auth'

const AuthContext = createContext<AuthContextValue | null>(null)

function isValidStoredUser(candidate: unknown): candidate is User {
  if (!candidate || typeof candidate !== 'object') return false
  const u = candidate as Record<string, unknown>
  return (
    typeof u.id === 'string' &&
    typeof u.email === 'string' &&
    typeof u.name === 'string' &&
    typeof u.role === 'string'
  )
}

function loadStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, token: null, loading: true }
    const parsed = JSON.parse(raw) as { user?: unknown; token?: unknown }
    // Snapshots de versões antigas (mocks) podem ter shape divergente ou
    // faltando campos obrigatórios; descarta silenciosamente para não
    // quebrar o Header/páginas que assumem name/role/etc.
    if (typeof parsed.token !== 'string' || !isValidStoredUser(parsed.user)) {
      localStorage.removeItem(STORAGE_KEY)
      return { user: null, token: null, loading: true }
    }
    setAuthToken(parsed.token)
    return { user: parsed.user, token: parsed.token, loading: true }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return { user: null, token: null, loading: true }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadStoredAuth)

  const persist = useCallback((user: User | null, token: string | null) => {
    if (user && token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
      setAuthToken(token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
      setAuthToken(null)
    }
    setState({ user, token, loading: false })
  }, [])

  const refreshUser = useCallback(async () => {
    if (!state.token) {
      setState((s) => ({ ...s, loading: false }))
      return
    }
    try {
      const user = await meRequest()
      persist(user, state.token)
    } catch {
      persist(null, null)
    }
  }, [persist, state.token])

  useEffect(() => {
    void refreshUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(
    async (email: string, password: string) => {
      const { user, token } = await loginRequest(email, password)
      persist(user, token)
    },
    [persist]
  )

  const register = useCallback(
    async (data: { email: string; name: string; cpf: string; password: string }) => {
      const { user, token } = await registerRequest(data)
      persist(user, token)
    },
    [persist]
  )

  const logout = useCallback(() => {
    persist(null, null)
  }, [persist])

  const value = useMemo(
    () => ({ ...state, login, register, logout, refreshUser }),
    [state, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
