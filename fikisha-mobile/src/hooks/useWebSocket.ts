import { useEffect } from 'react';
import { useTrackingStore } from '@/store/tracking.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { GpsUpdate, TransportEvent } from '@/types';

/**
 * Sets up (and tears down) the shared websocket connection and its
 * notification/tracking-store listeners. Call this once, at the app root —
 * child screens that just need to *emit* events should import the
 * emit* helpers from '@/lib/socket' directly instead of calling this hook,
 * since calling it again would re-run this listener setup.
 */
export function useWebSocket(enabled: boolean = true) {
  const { updateBusLocation } = useTrackingStore();
  const { prependNotification } = useNotificationsStore();

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    let cleanupListeners: (() => void) | undefined;

    const setup = async () => {
      await connectSocket();
      const socket = await getSocket();

      if (!mounted) return;

      const handleBusUpdate = (data: GpsUpdate) => {
        updateBusLocation(data.busId, data);
      };

      const handleRouteStarted = (payload: any) => {
        prependNotification({
          type: 'BUS_APPROACHING',
          title: 'Route started',
          message: `Route ${payload?.route?.name ?? payload?.routeId ?? ''} is now active.`,
        });
      };

      const handleRouteEnded = () => {
        prependNotification({
          type: 'BUS_APPROACHING',
          title: 'Route ended',
          message: 'The route has ended.',
        });
      };

      const handleStudentPickup = (payload: TransportEvent) => {
        prependNotification({
          type: 'PICKED_UP',
          title: 'Student picked up',
          message: payload?.student
            ? `${payload.student.firstName} was picked up`
            : 'A student was picked up.',
        });
      };

      const handleStudentDropoff = (payload: TransportEvent) => {
        prependNotification({
          type: 'DROPPED_OFF',
          title: 'Student dropped off',
          message: payload?.student
            ? `${payload.student.firstName} was dropped off`
            : 'A student was dropped off.',
        });
      };

      const handleStudentAbsent = (payload: TransportEvent) => {
        prependNotification({
          type: 'ABSENT',
          title: 'Student marked absent',
          message: payload?.student
            ? `${payload.student.firstName} was marked absent`
            : 'A student was marked absent.',
        });
      };

      const handleConnect = () => console.log('[Socket] Connected');
      const handleDisconnect = () => console.log('[Socket] Disconnected');

      socket.on('bus_location_update', handleBusUpdate);
      socket.on('route_started', handleRouteStarted);
      socket.on('route_ended', handleRouteEnded);
      socket.on('student_picked_up', handleStudentPickup);
      socket.on('student_dropped_off', handleStudentDropoff);
      socket.on('student_marked_absent', handleStudentAbsent);
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      cleanupListeners = () => {
        socket.off('bus_location_update', handleBusUpdate);
        socket.off('route_started', handleRouteStarted);
        socket.off('route_ended', handleRouteEnded);
        socket.off('student_picked_up', handleStudentPickup);
        socket.off('student_dropped_off', handleStudentDropoff);
        socket.off('student_marked_absent', handleStudentAbsent);
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    };

    setup();

    return () => {
      mounted = false;
      cleanupListeners?.();
      disconnectSocket();
    };
  }, [enabled]);
}
