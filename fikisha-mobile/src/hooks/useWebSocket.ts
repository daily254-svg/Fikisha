import { useEffect } from 'react';
import { useTrackingStore } from '@/store/tracking.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { useEventsStore } from '@/store/events.store';
import { useBannerStore } from '@/store/banner.store';
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
  const { updateBusLocation, clearBusLocation, setRouteActive } = useTrackingStore();
  const { prependNotification } = useNotificationsStore();
  const { prependEvent } = useEventsStore();
  const { show: showBanner } = useBannerStore();

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
        if (payload?.busId) setRouteActive(payload.busId, true);

        const busLabel = payload?.busRegistration ?? 'The bus';
        const routeLabel = payload?.routeName ? ` on ${payload.routeName}` : '';
        const message = `${busLabel} is now on route${routeLabel}.`;

        prependNotification({
          type: 'BUS_APPROACHING',
          title: 'Route started',
          message,
        });
        showBanner({ title: 'Driver is on the way', message, tone: 'info' });
      };

      const handleRouteEnded = (payload: { busId: string }) => {
        if (payload?.busId) {
          clearBusLocation(payload.busId);
          setRouteActive(payload.busId, false);
        }
        prependNotification({
          type: 'BUS_APPROACHING',
          title: 'Route ended',
          message: 'The route has ended.',
        });
        showBanner({ title: 'Route ended', message: 'The bus has finished its route.', tone: 'info' });
      };

      const handleStudentPickup = (payload: TransportEvent) => {
        prependEvent(payload);
        const message = payload?.student
          ? `${payload.student.firstName} was picked up`
          : 'A student was picked up.';
        prependNotification({ type: 'PICKED_UP', title: 'Student picked up', message });
        showBanner({ title: 'Picked up', message, tone: 'success' });
      };

      const handleStudentDropoff = (payload: TransportEvent) => {
        prependEvent(payload);
        const message = payload?.student
          ? `${payload.student.firstName} was dropped off`
          : 'A student was dropped off.';
        prependNotification({ type: 'DROPPED_OFF', title: 'Student dropped off', message });
        showBanner({ title: 'Dropped off', message, tone: 'success' });
      };

      const handleStudentAbsent = (payload: TransportEvent) => {
        prependEvent(payload);
        const message = payload?.student
          ? `${payload.student.firstName} was marked absent`
          : 'A student was marked absent.';
        prependNotification({ type: 'ABSENT', title: 'Student marked absent', message });
        showBanner({ title: 'Marked absent', message, tone: 'warning' });
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
