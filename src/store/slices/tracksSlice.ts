import type { StateCreator } from 'zustand';
import type { MediaTrack } from '../../context/KaraokeContext';
import type { KaraokeStoreState, TracksSlice } from '../types';
import type { WaveformData } from '../../hooks/useAudioAnalyzer';

const getMediaDuration = (file: File, type: 'audio' | 'video'): Promise<number> => {
  return new Promise((resolve) => {
    const el = document.createElement(type);
    el.src = URL.createObjectURL(file);
    el.onloadedmetadata = () => {
      resolve(el.duration || 180);
      URL.revokeObjectURL(el.src);
    };
    el.onerror = () => {
      resolve(180);
    };
  });
};

export const createTracksSlice: StateCreator<
  KaraokeStoreState,
  [['zustand/subscribeWithSelector', never]],
  [],
  TracksSlice
> = (set, get) => ({
  tracks: [],
  mediaUrl: null,
  mediaType: null,
  mediaName: null,
  cachedPeaks: {},

  cachePeaks: (key: string, data: WaveformData) => {
    set((state) => ({
      cachedPeaks: {
        ...state.cachedPeaks,
        [key]: data,
      },
    }));
  },

  updateTrackWaveformData: (id: string, waveformData: WaveformData) => {
    const updated = get().tracks.map((t) => (t.id === id ? { ...t, waveformData } : t));
    get().syncMasterTrack(updated);
  },

  syncMasterTrack: (updatedTracks: MediaTrack[]) => {
    set({ tracks: updatedTracks });

    if (updatedTracks.length === 0) {
      set({
        mediaUrl: null,
        mediaType: null,
        mediaName: null,
        duration: 0,
        styleConfig: {
          ...get().styleConfig,
          bgType: get().styleConfig.bgType === 'video' ? 'color' : get().styleConfig.bgType,
          bgVideo: null,
        },
      });
      return;
    }

    // Video takes precedence as master, otherwise the first loaded track
    const videoTrack = updatedTracks.find((t) => t.type === 'video');
    const master = videoTrack || updatedTracks[0];

    set({
      mediaUrl: master.url,
      mediaType: master.type,
      mediaName: master.name,
    });

    if (master.type === 'video') {
      set((state) => ({
        styleConfig: { ...state.styleConfig, bgType: 'video', bgVideo: master.url },
      }));
    } else {
      set((state) => ({
        styleConfig: {
          ...state.styleConfig,
          bgType: state.styleConfig.bgType === 'video' ? 'color' : state.styleConfig.bgType,
          bgVideo: null,
        },
      }));
    }

    // Set total duration to the maximum span of all tracks combined
    const totalDuration = Math.max(...updatedTracks.map((t) => t.offset + t.duration));
    set({ duration: totalDuration });
  },

  addTrack: async (file: File, waveformData: MediaTrack['waveformData'] = null) => {
    const isVideo = file.type.startsWith('video/');
    const type = isVideo ? 'video' : 'audio';

    if (isVideo && get().tracks.some((t) => t.type === 'video')) {
      alert('Maximum 1 video background is supported.');
      return;
    }

    const durationVal = waveformData ? waveformData.duration : await getMediaDuration(file, type);
    const url = URL.createObjectURL(file);
    const newTrack: MediaTrack = {
      id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name: file.name,
      url,
      type,
      volume: 1.0,
      offset: 0,
      duration: durationVal || 180,
      waveformData: waveformData || null,
      isMuted: false,
      isSoloed: false,
    };

    const updated = [...get().tracks, newTrack];
    get().syncMasterTrack(updated);
  },

  removeTrack: (id: string) => {
    const track = get().tracks.find((t) => t.id === id);
    if (track) {
      URL.revokeObjectURL(track.url);
    }
    const updated = get().tracks.filter((t) => t.id !== id);
    get().syncMasterTrack(updated);
  },

  updateTrackOffset: (id: string, offset: number) => {
    const updated = get().tracks.map((t) =>
      t.id === id ? { ...t, offset: Math.max(0, offset) } : t
    );
    get().syncMasterTrack(updated);
  },

  updateTrackVolume: (id: string, volume: number) => {
    const updated = get().tracks.map((t) =>
      t.id === id ? { ...t, volume: Math.max(0, Math.min(1, volume)) } : t
    );
    get().syncMasterTrack(updated);
  },

  toggleMuteTrack: (id: string) => {
    const updated = get().tracks.map((t) => (t.id === id ? { ...t, isMuted: !t.isMuted } : t));
    get().syncMasterTrack(updated);
  },

  toggleSoloTrack: (id: string) => {
    const target = get().tracks.find((t) => t.id === id);
    if (!target) return;
    const nextSoloState = !target.isSoloed;
    const updated = get().tracks.map((t) =>
      t.id === id ? { ...t, isSoloed: nextSoloState } : { ...t, isSoloed: false }
    );
    get().syncMasterTrack(updated);
  },

  loadMedia: async (file: File) => {
    await get().addTrack(file);
  },

  clearMedia: () => {
    get().tracks.forEach((t) => URL.revokeObjectURL(t.url));
    get().syncMasterTrack([]);
  },
});
