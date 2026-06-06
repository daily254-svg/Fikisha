import { create } from 'zustand'
import { GpsUpdate } from '@/types'

interface TrackingState {
  busLocations: Record
  isTracking: boolean
  currentRouteId: string | null

  updateBusLocation: (busId: string, location: GpsUpdate) => void
  setTracking: (isTracking: boolean) => void
  setCurrentRoute: (routeId: string | null) => void
  clearTracking: () => void
}

export const useTrackingStore = create((set) => ({
  busLocations: {},
  isTracking: false,
  currentRouteId: null,

  updateBusLocation: (busId, location) =>
    set((state) => ({
      busLocations: { ...state.busLocations, [busId]: location },
    })),

  setTracking: (isTracking) => set({ isTracking }),

  setCurrentRoute: (routeId) => set({ currentRouteId: routeId }),

  clearTracking: () =>
    set({ busLocations: {}, isTracking: false, currentRouteId: null }),
}))
