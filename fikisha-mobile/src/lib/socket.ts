import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL;

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (!socket) {
    const token = await SecureStore.getItemAsync('fikisha_token');

    socket = io(`${WS_URL}/tracking`, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
}

export async function connectSocket(): Promise<void> {
  const s = await getSocket();
  if (!s.connected) s.connect();
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
  }
}