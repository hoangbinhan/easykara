import React, { useState } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { FileText, Play, RotateCcw, Lock, LockOpen } from 'lucide-react';

export const LyricsInput: React.FC = () => {
  const { lyricsInput, setLyricsInput, parseLyrics, lines, resetSync } = useKaraoke();
  const [isLocked, setIsLocked] = useState(false);
  const [localText, setLocalText] = useState(lyricsInput);

  const handleApply = () => {
    setLyricsInput(localText);
    parseLyrics(localText);
    setIsLocked(true);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all sync data and reset everything?')) {
      resetSync();
      setIsLocked(false);
    }
  };

  return (
    <div className="bg-graphite-deep border border-graphite-light rounded-[4px] p-4 flex flex-col gap-3 transition-colors duration-200 hover:border-neon-glow/40 flex-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-neon-glow">
          <FileText size={14} />
          <span>Lyrics</span>
        </div>
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`p-1 bg-transparent border-none transition-colors duration-200 cursor-pointer flex items-center ${
            isLocked ? 'text-neon-glow' : 'text-ash hover:text-neon-glow'
          }`}
          title={isLocked ? 'Unlock Lyrics Editing' : 'Lock Lyrics to Prevent Edits'}
        >
          {isLocked ? <Lock size={14} /> : <LockOpen size={14} />}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <textarea
          className="w-full flex-1 min-h-[140px] px-3.5 py-2.5 bg-blackout border border-graphite-light rounded-[4px] text-whiteout font-sans text-xs leading-normal resize-none focus:border-neon-glow focus:bg-neon-muted/5 transition-colors duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          disabled={isLocked}
          placeholder="Enter your song lyrics here..."
        />

        <div className="flex gap-2">
          {!isLocked ? (
            <button
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2 bg-whiteout text-graphite-deep font-sans text-xs font-semibold rounded-full hover:bg-cloud active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Play size={12} className="fill-current" />
              <span>Load Lyrics & Start</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLocked(false)}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2 bg-transparent text-whiteout font-sans text-xs font-semibold border border-graphite-light rounded-full hover:bg-neon-muted/10 hover:border-neon-glow transition-all duration-200 cursor-pointer"
            >
              <LockOpen size={12} />
              <span>Edit Lyrics</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-transparent border border-system-warning/40 text-system-warning hover:bg-system-warning/10 hover:border-system-warning rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center"
            title="Reset All Sync Progress"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        <div className="font-sans text-[11px] text-ash bg-blackout border border-graphite-light rounded-[4px] p-3.5 leading-relaxed">
          💡 <strong className="text-whiteout font-semibold">Tip:</strong> Enter lyrics normally. Spaces automatically split words, enabling word-by-word sync by pressing Space.
        </div>

        {lines.length > 0 && (
          <div className="font-mono text-[10px] text-neon-glow font-medium">
            📊 Total lines: <strong className="text-whiteout">{lines.length}</strong> | Total words:{' '}
            <strong className="text-whiteout">{lines.reduce((acc, curr) => acc + curr.syllables.length, 0)}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
