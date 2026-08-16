import axios, { type AxiosError } from 'axios'

// L'API Payload est servie par cette même application : une base relative suffit
// côté navigateur, et NEXT_PUBLIC_SERVER_URL prend le relais côté serveur.
export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // handle unauthenticated — redirect to login or clear session
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
)
