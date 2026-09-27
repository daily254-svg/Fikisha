import { create } from 'zustand';

export type BannerTone = 'info' | 'success' | 'warning';

export interface BannerData {
  id: string;
  title: string;
  message: string;
  tone: BannerTone;
}

interface BannerState {
  current: BannerData | null;
  show: (banner: Omit<BannerData, 'id'>) => void;
  dismiss: () => void;
}

export const useBannerStore = create<BannerState>((set) => ({
  current: null,

  show: (banner) => set({ current: { ...banner, id: `${Date.now()}-${Math.random()}` } }),

  dismiss: () => set({ current: null }),
}));
