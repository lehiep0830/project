/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type AxiosError,
  type AxiosRequestHeaders,
} from 'axios'

// Enum for environments
enum ApiEnv {
  ADMIN = 'ADMIN',
  AUTH  = 'AUTH',
  API_PROTECTED = 'API_PROTECTED',
  PROD_ADMIN = 'PROD_ADMIN',
  PROD_API_PROTECTED = 'PROD_API_PROTECTED',
}

// Map Enum -> BaseURL
const BaseURLs: Record<ApiEnv, string> = {
  [ApiEnv.ADMIN]: 'http://localhost:8000/api',
  [ApiEnv.AUTH]: 'http://localhost:8000/api/auth/',
  [ApiEnv.API_PROTECTED]: 'http://localhost:8000/api-protected/',
  [ApiEnv.PROD_ADMIN]: 'https://api.example.com',
  [ApiEnv.PROD_API_PROTECTED]: 'https://api.example.com',
}

// Create Axios instance by environment
export const createApiClient = (env: ApiEnv): AxiosInstance => {
  const apiClient: AxiosInstance = axios.create({
    baseURL: BaseURLs[env],
    timeout: 10000,
  })

  // Request interceptor
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = localStorage.getItem('token')
      if (token) {
        if (!config.headers) {
          config.headers = {} as AxiosRequestHeaders
        }
        config.headers['Authorization'] = `Bearer ${token}`
      }

      config.headers['Content-Type'] = 'application/json'
      config.headers['Accept'] = 'application/json'

      config.params = {
        ...config.params,
        lang: 'vi',
      }

      return config
    },
    (error: unknown) => Promise.reject(error),
  )

  // Response interceptor
  apiClient.interceptors.response.use(
    (response: AxiosResponse): any => {
      return response.data as unknown
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        console.error('Token expired or invalid!')
      }
      return Promise.reject(error)
    },
  )

  // Auto refresh token every 5 minutes
  setInterval(
    async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) return

        const res = await axios.post(`${BaseURLs[env]}/auth/refresh`, {
          refreshToken,
        })

        const newToken = res.data?.accessToken
        if (newToken) {
          localStorage.setItem('authToken', newToken)
          console.log('Token updated!')
        }
      } catch (err) {
        console.error('Refresh token failed:', err)
      }
    },
    5 * 60 * 1000,
  )

  return apiClient
}

// Interface for API call options
interface CallApiOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  payload?: unknown
  params?: Record<string, unknown>
}

// Generic API call function
export const callApi = async (
  apiClient: AxiosInstance,
  { url, method = 'GET', payload = {}, params = {} }: CallApiOptions,
): Promise<unknown> => {
  try {
    const response = await apiClient({
      url,
      method,
      data: payload,
      params,
    })
    return response
  } catch (error) {
    throw error
  }
}

export const apiClient: Record<ApiEnv, AxiosInstance> = {
  [ApiEnv.ADMIN]: createApiClient(ApiEnv.ADMIN),
  [ApiEnv.AUTH]: createApiClient(ApiEnv.AUTH),
  [ApiEnv.API_PROTECTED]: createApiClient(ApiEnv.API_PROTECTED),
  [ApiEnv.PROD_ADMIN]: createApiClient(ApiEnv.PROD_ADMIN),
  [ApiEnv.PROD_API_PROTECTED]: createApiClient(ApiEnv.PROD_API_PROTECTED),
}
