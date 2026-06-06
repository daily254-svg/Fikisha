import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
}

export function useLocation(watch = false): LocationState {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

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
          (loc) => {
            setState({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              error: null,
              isLoading: false,
            });
          },
        );
      } else {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setState({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          error: null,
          isLoading: false,
        });
      }
    };

    start();

    return () => {
      subscription?.remove();
    };
  }, [watch]);

  return state;
}