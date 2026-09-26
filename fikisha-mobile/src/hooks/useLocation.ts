import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  heading: number | null;
  error: string | null;
  isLoading: boolean;
}

export function useLocation(watch = false): LocationState {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    speed: null,
    heading: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    const apply = (loc: Location.LocationObject) => {
      if (cancelled) return;
      setState({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        // expo-location reports speed in m/s; convert to km/h for display/emission.
        speed: loc.coords.speed != null ? Math.max(loc.coords.speed * 3.6, 0) : null,
        heading: loc.coords.heading ?? null,
        error: null,
        isLoading: false,
      });
    };

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setState((s) => ({
          ...s,
          error: 'Location permission denied',
          isLoading: false,
        }));
        return;
      }

      if (watch) {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 10,
          },
          apply,
        );
      } else {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        apply(loc);
      }
    };

    start();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [watch]);

  return state;
}
