import type { StateCreator } from 'zustand';
import type { KaraokeStoreState, SyncSlice } from '../types';

export const createSyncSlice: StateCreator<
  KaraokeStoreState,
  [['zustand/subscribeWithSelector', never]],
  [],
  SyncSlice
> = (set, get) => ({
  currentLineIndex: 0,
  currentSyllableIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1.0,
  isRecording: false,

  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration: duration }),
  setPlaybackRate: (rate: number) => set({ playbackRate: rate }),
  setIsRecording: (recording: boolean) => set({ isRecording: recording }),

  startSyllableSync: (time: number) => {
    const { lines, currentLineIndex, currentSyllableIndex } = get();
    if (lines.length === 0 || currentLineIndex >= lines.length) return;

    const currentLine = lines[currentLineIndex];
    if (currentSyllableIndex >= currentLine.syllables.length) return;

    get().pushHistory(lines, currentLineIndex, currentSyllableIndex);

    const newLines = [...lines];
    const targetSyl = { ...newLines[currentLineIndex].syllables[currentSyllableIndex] };

    targetSyl.startTime = Number(time.toFixed(3));
    targetSyl.endTime = null;

    newLines[currentLineIndex].syllables[currentSyllableIndex] = targetSyl;

    if (currentSyllableIndex === 0) {
      newLines[currentLineIndex].startTime = Number(time.toFixed(3));
    }

    set({ lines: newLines });
  },

  endSyllableSync: (time: number) => {
    const { lines, currentLineIndex, currentSyllableIndex } = get();
    if (lines.length === 0 || currentLineIndex >= lines.length) return;

    const currentLine = lines[currentLineIndex];
    if (currentSyllableIndex >= currentLine.syllables.length) return;

    const newLines = [...lines];
    const targetSyl = { ...newLines[currentLineIndex].syllables[currentSyllableIndex] };

    const endT = Number(time.toFixed(3));
    const startT = targetSyl.startTime !== null ? targetSyl.startTime : endT - 0.1;

    targetSyl.startTime = startT;
    targetSyl.endTime = Math.max(endT, startT + 0.05); // Min duration 50ms

    newLines[currentLineIndex].syllables[currentSyllableIndex] = targetSyl;
    newLines[currentLineIndex].endTime = targetSyl.endTime;

    set({ lines: newLines });

    if (currentSyllableIndex + 1 < currentLine.syllables.length) {
      set({ currentSyllableIndex: currentSyllableIndex + 1 });
    } else if (currentLineIndex + 1 < lines.length) {
      set({
        currentLineIndex: currentLineIndex + 1,
        currentSyllableIndex: 0,
      });
    } else {
      set({
        isRecording: false,
        currentSyllableIndex: currentSyllableIndex + 1,
      });
    }
  },

  resetSync: () => {
    const { lines, currentLineIndex, currentSyllableIndex } = get();
    get().pushHistory(lines, currentLineIndex, currentSyllableIndex);

    const resetLines = lines.map((line) => ({
      ...line,
      startTime: null,
      endTime: null,
      syllables: line.syllables.map((s) => ({
        ...s,
        startTime: null,
        endTime: null,
      })),
    }));

    set({
      lines: resetLines,
      currentLineIndex: 0,
      currentSyllableIndex: 0,
      isRecording: false,
    });
  },

  jumpToSyllable: (lineIdx: number, sylIdx: number) => {
    const { lines } = get();
    if (lineIdx >= 0 && lineIdx < lines.length) {
      const line = lines[lineIdx];
      if (sylIdx >= 0 && sylIdx <= line.syllables.length) {
        set({
          currentLineIndex: lineIdx,
          currentSyllableIndex: sylIdx,
        });
      }
    }
  },
});
