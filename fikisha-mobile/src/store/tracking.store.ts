import { create } from 'zustand';
import { GpsUpdate } from '@/types';

interface TrackingState {
  busLocations: Record<string, GpsUpdate>;
  isTracking: boolean;
  currentBusId: string | null;

  updateBusLocation: (busId: string, location: GpsUpdate) => void;
  clearBusLocation: (busId: string) => void;
  setTracking: (isTracking: boolean) => void;
  setCurrentBus: (busId: string | null) => void;
  clearTracking: () => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
  busLocations: {},
  isTracking: false,
  currentBusId: null,

  updateBusLocation: (busId, location) =>
    set((state) => ({
      busLocations: { ...state.busLocations, [busId]: location },
    })),

  clearBusLocation: (busId) =>
    set((state) => {
      const { [busId]: _removed, ...rest } = state.busLocations;
      return { busLocations: rest };
    }),

  setTracking: (isTracking) => set({ isTracking }),

  setCurrentBus: (busId) => set({ currentBusId: busId }),

  clearTracking: () =>
    set({ busLocations: {}, isTracking: false, currentBusId: null }),
}));