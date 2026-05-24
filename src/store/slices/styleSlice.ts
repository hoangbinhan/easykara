import type { StateCreator } from 'zustand';
import type { StyleConfig } from '../../context/KaraokeContext';
import type { KaraokeStoreState, StyleSlice } from '../types';

export const defaultStyle: StyleConfig = {
  fontFamily: 'Montserrat',
  fontSize: 42,
  fillColor: '#f7f9fa', // Cloud Whisper
  activeColor: '#af50ff', // Deep Violet
  strokeColor: '#090909', // Midnight Eclipse
  strokeWidth: 6,
  alignment: 'center',
  layoutMode: 'classic-2line',
  bgType: 'color',
  bgColor: '#090909', // Midnight Eclipse
  bgImage: null,
  bgVideo: null,
  shadowColor: 'rgba(0, 0, 0, 0.6)',
  shadowBlur: 10,
};

export const createStyleSlice: StateCreator<
  KaraokeStoreState,
  [['zustand/subscribeWithSelector', never]],
  [],
  StyleSlice
> = (set) => ({
  styleConfig: defaultStyle,
  
  updateStyleConfig: (config) =>
    set((state) => ({
      styleConfig: { ...state.styleConfig, ...config },
    })),
});
