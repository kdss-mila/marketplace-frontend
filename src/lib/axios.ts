import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('marketplace_auth')
  if (stored) {
    try {
      const { token } = JSON.parse(stored) as { token: string }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // ignore invalid storage
    }
  }
  return config
})

export default api
