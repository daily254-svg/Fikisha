import * as SecureStore from 'expo-secure-store';

export const storage = {
  set: (key: string, value: string): Promise<void> =>
    SecureStore.setItemAsync(key, value),

  get: (key: string): Promise<string | null> =>
    SecureStore.getItemAsync(key),

  delete: (key: string): Promise<void> =>
    SecureStore.deleteItemAsync(key),

  setObject: (key: string, value: unknown): Promise<void> =>
    SecureStore.setItemAsync(key, JSON.stringify(value)),

  getObject: async <T = unknown>(key: string): Promise<T | null> => {
    const val = await SecureStore.getItemAsync(key);
    return val ? (JSON.parse(val) as T) : null;
  },
};