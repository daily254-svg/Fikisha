import * as SecureStore from 'expo-secure-store'

export const storage = {
  set: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),

  get: (key: string) =>
    SecureStore.getItemAsync(key),

  delete: (key: string) =>
    SecureStore.deleteItemAsync(key),

  setObject: (key: string, value: unknown) =>
    SecureStore.setItemAsync(key, JSON.stringify(value)),

  getObject: async (key: string): Promise => {
    const val = await SecureStore.getItemAsync(key)
    return val ? JSON.parse(val) : null
  },
}
