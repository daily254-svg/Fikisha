import { create } from 'zustand';
import { GpsUpdate } from '@/types';

interface TrackingState {
  busLocations: Record<string, GpsUpdate>;
  isTracking: boolean;
  currentBusId: string | null;
  /** busId -> true while a driver has an active trip on that bus, updated
   * from route_started/route_ended — independent of whether a GPS ping has
   * actually arrived yet, so the UI can say "on the way" the instant the
   * driver starts instead of waiting on the first location update. */
  activeRouteBuses: Record<string, boolean>;

  updateBusLocation: (busId: string, location: GpsUpdate) => void;
  clearBusLocation: (busId: string) => void;
  setRouteActive: (busId: string, active: boolean) => void;
  setTracking: (isTracking: boolean) => void;
  setCurrentBus: (busId: string | null) => void;
  clearTracking: () => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
  busLocations: {},
  isTracking: false,
  currentBusId: null,
  activeRouteBuses: {},

  updateBusLocation: (busId, location) =>
    set((state) => ({
      busLocations: { ...state.busLocations, [busId]: location },
    })),

  clearBusLocation: (busId) =>
    set((state) => {
      const { [busId]: _removed, ...rest } = state.busLocations;
      return { busLocations: rest };
    }),

  setRouteActive: (busId, active) =>
    set((state) => ({
      activeRouteBuses: { ...state.activeRouteBuses, [busId]: active },
    })),

  setTracking: (isTracking) => set({ isTracking }),

  setCurrentBus: (busId) => set({ currentBusId: busId }),

  clearTracking: () =>
    set({ busLocations: {}, isTracking: false, currentBusId: null }),
}));