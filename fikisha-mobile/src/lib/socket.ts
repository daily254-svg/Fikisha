import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import type { GpsUpdate } from '@/types';

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
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Fire-and-forget event emitters. These can be imported directly by any
// screen — they don't need the useWebSocket() hook, which also sets up
// (and tears down) the shared listener subscriptions; that only needs to
// run once, at the app root.

export async function emitGpsUpdate(data: GpsUpdate): Promise<void> {
  const socket = await getSocket();
  socket.emit('gps_update', data);
}

export async function emitRouteStart(busId: string, routeId: string): Promise<void> {
  const socket = await getSocket();
  socket.emit('route_start', { busId, routeId });
}

export async function emitRouteEnd(busId: string): Promise<void> {
  const socket = await getSocket();
  socket.emit('route_end', { busId });
}

export async function emitStudentPickup(
  busId: string,
  studentId: string,
  lat?: number,
  lng?: number,
): Promise<void> {
  const socket = await getSocket();
  socket.emit('student_pickup', { busId, studentId, lat, lng });
}

export async function emitStudentDropoff(
  busId: string,
  studentId: string,
  lat?: number,
  lng?: number,
): Promise<void> {
  const socket = await getSocket();
  socket.emit('student_dropoff', { busId, studentId, lat, lng });
}

export async function emitStudentAbsent(
  busId: string,
  studentId: string,
  lat?: number,
  lng?: number,
): Promise<void> {
  const socket = await getSocket();
  socket.emit('student_absent', { busId, studentId, lat, lng });
}