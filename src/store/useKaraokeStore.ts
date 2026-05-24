import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { KaraokeStoreState } from './types';
import { createStyleSlice } from './slices/styleSlice';
import { createTracksSlice } from './slices/tracksSlice';
import { createTimelineSlice } from './slices/timelineSlice';
import { createSyncSlice } from './slices/syncSlice';

export const useKaraokeStore = create<KaraokeStoreState>()(
  subscribeWithSelector((...args) => ({
    ...createStyleSlice(...args),
    ...createTracksSlice(...args),
    ...createTimelineSlice(...args),
    ...createSyncSlice(...args),
  }))
);
