import { useEffect } from 'react';
import { useTrackingStore } from '@/store/tracking.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { GpsUpdate } from '@/types';

export function useWebSocket() {
  const { updateBusLocation } = useTrackingStore();
  const { addNotification } = useNotificationsStore();

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      await connectSocket();
      const socket = await getSocket();

      if (!mounted) return;

      const handleBusUpdate = (data: GpsUpdate) => {
        updateBusLocation(data.busId, data);
      };

      const handleRouteStarted = (payload: any) => {
        addNotification({
          type: 'route_started',
          title: 'Route started',
          body: `Route ${payload?.route?.name ?? payload?.routeId ?? 'started'} is now active.`,
        });
      };

      const handleRouteEnded = (payload: any) => {
        addNotification({
          type: 'route_ended',
          title: 'Route ended',
          body: `Route on bus ${payload?.busId ?? 'unknown'} has ended.`,
        });
      };

      const handleStudentPickup = (payload: any) => {
        addNotification({
          type: 'student_picked_up',
          title: 'Student picked up',
          body: `A student was picked up on bus ${payload?.busId ?? 'unknown'}.`,
        });
      };

      const handleStudentDropoff = (payload: any) => {
        addNotification({
          type: 'student_dropped_off',
          title: 'Student dropped off',
          body: `A student was dropped off on bus ${payload?.busId ?? 'unknown'}.`,
        });
      };

      const handleConnect = () => console.log('[Socket] Connected');
      const handleDisconnect = () => console.log('[Socket] Disconnected');

      socket.on('bus_location_update', handleBusUpdate);
      socket.on('route_started', handleRouteStarted);
      socket.on('route_ended', handleRouteEnded);
      socket.on('student_picked_up', handleStudentPickup);
      socket.on('student_dropped_off', handleStudentDropoff);
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('bus_location_update', handleBusUpdate);
        socket.off('route_started', handleRouteStarted);
        socket.off('route_ended', handleRouteEnded);
        socket.off('student_picked_up', handleStudentPickup);
        socket.off('student_dropped_off', handleStudentDropoff);
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