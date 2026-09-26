import { create } from 'zustand'
import { GpsUpdate } from '@/types'

interface TrackingState {
  busLocations: Record<string, GpsUpdate>
  activeBuses: string[]

  updateBusLocation: (busId: string, location: GpsUpdate) => void
  setActiveBuses: (busIds: string[]) => void
  clearTracking: () => void
}

export const useTrackingStore = create<TrackingState>((set) => ({
  busLocations: {},
  activeBuses: [],

  updateBusLocation: (busId, location) =>
    set((state) => ({
      busLocations: { ...state.busLocations, [busId]: location },
    })),

  setActiveBuses: (busIds) => set({ activeBuses: busIds }),

  clearTracking: () => set({ busLocations: {}, activeBuses: [] }),
}))
