import apiClient from '@/lib/api'
import { AxiosRequestConfig } from 'axios'

export async function get(url: string, config?: AxiosRequestConfig): Promise {
  const response = await apiClient.get(url, config)
  return response.data
}

export async function post(url: string, data?: unknown, config?: AxiosRequestConfig): Promise {
  const response = await apiClient.post(url, data, config)
  return response.data
}

export async function patch(url: string, data?: unknown, config?: AxiosRequestConfig): Promise {
  const response = await apiClient.patch(url, data, config)
  return response.data
}

export async function del(url: string, config?: AxiosRequestConfig): Promise {
  const response = await apiClient.delete(url, config)
  return response.data
}
