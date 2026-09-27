import { create } from 'zustand';
import { TransportEvent } from '@/types';

const MAX_EVENTS = 20;

interface EventsState {
  recentEvents: TransportEvent[];
  setEvents: (events: TransportEvent[]) => void;
  prependEvent: (event: TransportEvent) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  recentEvents: [],

  setEvents: (events) => set({ recentEvents: events }),

  prependEvent: (event) =>
    set((state) => ({
      recentEvents: [event, ...state.recentEvents.filter((e) => e.id !== event.id)].slice(
        0,
        MAX_EVENTS,
      ),
    })),
}));
