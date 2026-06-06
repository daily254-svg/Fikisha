import api from '@/lib/axios'
import { AxiosRequestConfig } from 'axios'

export async function get(url: string, config?: AxiosRequestConfig): Promise {
  const response = await api.get(url, config)
  return response.data
}

export async function post(url: string, data?: unknown, config?: AxiosRequestConfig): Promise {
  const response = await api.post(url, data, config)
  return response.data
}

export async function patch(url: string, data?: unknown, config?: AxiosRequestConfig): Promise {
  const response = await api.patch(url, data, config)
  return response.data
}

export async function del(url: string, config?: AxiosRequestConfig): Promise {
  const response = await api.delete(url, config)
  return response.data
}
