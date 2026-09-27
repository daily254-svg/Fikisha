import { useTrackingStore } from '@/store/tracking.store';
import { trackingService } from '@/services/tracking.service';
import { useEffect, useState } from 'react';
import { BusLocationResponse, GpsUpdate } from '@/types';

export function useTracking(busId: string | null) {
  const { busLocations, activeRouteBuses } = useTrackingStore();
  const [dbLocation, setDbLocation] = useState<BusLocationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const liveLocation: GpsUpdate | null = busId ? busLocations[busId] ?? null : null;
  const routeActive = busId ? !!activeRouteBuses[busId] : false;

  useEffect(() => {
    if (!busId || liveLocation) return;

    setIsLoading(true);
    trackingService
      .getBusLocation(busId)
      .then((response) => setDbLocation(response.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [busId, liveLocation]);

  return {
    liveLocation,
    dbLocation,
    isLive: !!liveLocation,
    routeActive,
    isLoading,
  };
}