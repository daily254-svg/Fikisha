import { useEffect } from 'react';
import { useTrackingStore } from '@/store/tracking.store';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { GpsUpdate } from '@/types';

export function useWebSocket() {
  const { updateBusLocation } = useTrackingStore();

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      await connectSocket();
      const socket = await getSocket();

      if (!mounted) return;

      const handleBusUpdate = (data: GpsUpdate) => {
        updateBusLocation(data.busId, data);
      };

      const handleConnect = () => console.log('[Socket] Connected');
      const handleDisconnect = () => console.log('[Socket] Disconnected');

      socket.on('bus_location_update', handleBusUpdate);
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('bus_location_update', handleBusUpdate);
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    };

    setup();

    return () => {
      mounted = false;
      disconnectSocket();
    };
  }, []);

  const emitGpsUpdate = async (data: GpsUpdate) => {
    const socket = await getSocket();
    socket.emit('gps_update', data);
  };

  const emitRouteStart = async (busId: string, routeId: string) => {
    const socket = await getSocket();
    socket.emit('route_start', { busId, routeId });
  };

  const emitRouteEnd = async (busId: string) => {
    const socket = await getSocket();
    socket.emit('route_end', { busId });
  };

  const emitStudentPickup = async (busId: string, studentId: string, lat?: number, lng?: number) => {
    const socket = await getSocket();
    socket.emit('student_pickup', { busId, studentId, lat, lng });
  };

  const emitStudentDropoff = async (busId: string, studentId: string, lat?: number, lng?: number) => {
    const socket = await getSocket();
    socket.emit('student_dropoff', { busId, studentId, lat, lng });
  };

  return {
    emitGpsUpdate,
    emitRouteStart,
    emitRouteEnd,
    emitStudentPickup,
    emitStudentDropoff,
  };
}