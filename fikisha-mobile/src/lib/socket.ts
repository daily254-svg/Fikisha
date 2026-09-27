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

// Event emitters. These can be imported directly by any screen — they
// don't need the useWebSocket() hook, which also sets up (and tears down)
// the shared listener subscriptions; that only needs to run once, at the
// app root.

interface Ack<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

const ACK_TIMEOUT_MS = 8000;

/**
 * Emits an event and waits for the server's acknowledgement instead of
 * firing blind. Without this, a server-side failure (bad data, an
 * out-of-date Prisma client, a DB error) is invisible to the caller — the
 * emit "succeeds" from the client's point of view the instant it's sent,
 * so any UI that optimistically updates on that alone drifts out of sync
 * with what the backend actually did.
 */
function emitWithAck<T = any>(event: string, payload: any): Promise<T> {
  return new Promise((resolve, reject) => {
    getSocket().then((socket) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timed out — check your connection and try again.'));
      }, ACK_TIMEOUT_MS);

      socket.emit(event, payload, (ack: Ack<T>) => {
        clearTimeout(timer);
        if (ack?.success) {
          resolve(ack.data as T);
        } else {
          reject(new Error(ack?.error ?? 'Something went wrong. Try again.'));
        }
      });
    });
  });
}

export async function emitGpsUpdate(data: GpsUpdate): Promise<void> {
  const socket = await getSocket();
  socket.emit('gps_update', data);
}

export function emitRouteStart(busId: string, routeId: string): Promise<any> {
  return emitWithAck('route_start', { busId, routeId });
}

export function emitRouteEnd(busId: string): Promise<any> {
  return emitWithAck('route_end', { busId });
}

export function emitStudentPickup(
  busId: string,
  studentId: string,
  lat?: number,
  lng?: number,
): Promise<any> {
  return emitWithAck('student_pickup', { busId, studentId, lat, lng });
}

export function emitStudentDropoff(
  busId: string,
  studentId: string,
  lat?: number,
  lng?: number,
): Promise<any> {
  return emitWithAck('student_dropoff', { busId, studentId, lat, lng });
}

export function emitStudentAbsent(
  busId: string,
  studentId: string,
  lat?: number,
  lng?: number,
): Promise<any> {
  return emitWithAck('student_absent', { busId, studentId, lat, lng });
}