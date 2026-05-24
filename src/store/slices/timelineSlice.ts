import type { StateCreator } from 'zustand';
import type { Line, Syllable } from '../../context/KaraokeContext';
import type { KaraokeStoreState, TimelineSlice } from '../types';

const parseLyricsText = (input: string): Line[] => {
  const rawLines = input.split('\n');
  return rawLines
    .map((lineText, lIdx) => {
      const trimmed = lineText.trim();
      if (!trimmed) return null;

      // Split by whitespaces to get words/syllables
      const words = trimmed.split(/\s+/);
      const syllables: Syllable[] = words.map((word, sIdx) => ({
        id: `syl-${lIdx}-${sIdx}-${Math.random().toString(36).substring(2, 11)}`,
        text: word,
        startTime: null,
        endTime: null,
      }));

      return {
        id: `line-${lIdx}-${Math.random().toString(36).substring(2, 11)}`,
        text: trimmed,
        syllables,
        startTime: null,
        endTime: null,
      } as Line;
    })
    .filter((item): item is Line => item !== null);
};

const initialInput = 'Create custom karaoke videos manually\nSync syllables instantly using spacebar\nBreathtaking celestial tech UI design\nExport subtitle files and premium lyrics';

export const createTimelineSlice: StateCreator<
  KaraokeStoreState,
  [['zustand/subscribeWithSelector', never]],
  [],
  TimelineSlice
> = (set, get) => ({
  lyricsInput: initialInput,
  lines: parseLyricsText(initialInput),
  undoStack: [],
  redoStack: [],

  pushHistory: (currentLines: Line[], lineIdx: number, sylIdx: number) => {
    const clonedLines = JSON.parse(JSON.stringify(currentLines));
    set({
      undoStack: [
        ...get().undoStack,
        { lines: clonedLines, currentLineIndex: lineIdx, currentSyllableIndex: sylIdx },
      ],
      redoStack: [],
    });
  },

  undo: () => {
    const { undoStack, lines, currentLineIndex, currentSyllableIndex } = get();
    if (undoStack.length === 0) return;

    const previous = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    const currentCloned = JSON.parse(JSON.stringify(lines));
    const newRedoStack = [
      ...get().redoStack,
      { lines: currentCloned, currentLineIndex, currentSyllableIndex },
    ];

    set({
      lines: previous.lines,
      currentLineIndex: previous.currentLineIndex,
      currentSyllableIndex: previous.currentSyllableIndex,
      undoStack: newUndoStack,
      redoStack: newRedoStack,
    });
  },

  redo: () => {
    const { redoStack, lines, currentLineIndex, currentSyllableIndex } = get();
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    const currentCloned = JSON.parse(JSON.stringify(lines));
    const newUndoStack = [
      ...get().undoStack,
      { lines: currentCloned, currentLineIndex, currentSyllableIndex },
    ];

    set({
      lines: next.lines,
      currentLineIndex: next.currentLineIndex,
      currentSyllableIndex: next.currentSyllableIndex,
      undoStack: newUndoStack,
      redoStack: newRedoStack,
    });
  },

  parseLyrics: (input: string) => {
    const parsed = parseLyricsText(input);
    set({
      lines: parsed,
      currentLineIndex: 0,
      currentSyllableIndex: 0,
      undoStack: [],
      redoStack: [],
    });
  },

  setLyricsInput: (input: string) => {
    const parsed = parseLyricsText(input);
    set({
      lyricsInput: input,
      lines: parsed,
      currentLineIndex: 0,
      currentSyllableIndex: 0,
      undoStack: [],
      redoStack: [],
    });
  },

  setLines: (newLines: Line[]) => {
    get().pushHistory(get().lines, get().currentLineIndex, get().currentSyllableIndex);
    set({ lines: newLines });
  },

  updateSyllableTime: (lineIdx: number, sylIdx: number, start: number | null, end: number | null) => {
    const { lines, currentLineIndex, currentSyllableIndex } = get();
    if (lineIdx < 0 || lineIdx >= lines.length) return;
    const line = lines[lineIdx];
    if (sylIdx < 0 || sylIdx >= line.syllables.length) return;

    get().pushHistory(lines, currentLineIndex, currentSyllableIndex);

    const newLines = JSON.parse(JSON.stringify(lines)) as Line[];
    const syl = newLines[lineIdx].syllables[sylIdx];
    syl.startTime = start !== null ? Number(start.toFixed(3)) : null;
    syl.endTime = end !== null ? Number(end.toFixed(3)) : null;

    // Recalculate line boundaries
    const activeSyls = newLines[lineIdx].syllables.filter((s) => s.startTime !== null);
    if (activeSyls.length > 0) {
      newLines[lineIdx].startTime = Math.min(...activeSyls.map((s) => s.startTime!));
      newLines[lineIdx].endTime = Math.max(...activeSyls.map((s) => s.endTime || s.startTime!));
    } else {
      newLines[lineIdx].startTime = null;
      newLines[lineIdx].endTime = null;
    }

    set({ lines: newLines });
  },

  updateSyllableText: (lineIdx: number, sylIdx: number, text: string) => {
    const { lines, currentLineIndex, currentSyllableIndex } = get();
    if (lineIdx < 0 || lineIdx >= lines.length) return;
    const line = lines[lineIdx];
    if (sylIdx < 0 || sylIdx >= line.syllables.length) return;

    get().pushHistory(lines, currentLineIndex, currentSyllableIndex);

    const newLines = [...lines];
    const newSyllables = [...newLines[lineIdx].syllables];
    newSyllables[sylIdx] = { ...newSyllables[sylIdx], text: text.trim() };
    newLines[lineIdx] = {
      ...newLines[lineIdx],
      syllables: newSyllables,
      text: newSyllables.map((s) => s.text).join(' '),
    };

    set({ lines: newLines });
  },
});
