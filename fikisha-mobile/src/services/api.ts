import api from '@/lib/api';

export async function get<T = any>(url: string, params?: Record<string, any>) {
  const response = await api.get<T>(url, { params });
  return response;
}

export async function post<T = any>(url: string, data?: any) {
  const response = await api.post<T>(url, data);
  return response;
}

export async function patch<T = any>(url: string, data?: any) {
  const response = await api.patch<T>(url, data);
  return response;
}

export async function del<T = any>(url: string) {
  const response = await api.delete<T>(url);
  return response;
}