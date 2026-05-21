import React from 'react';
import type { Line, Syllable } from '../../context/KaraokeContext';

interface UpcomingItem {
  type: string;
  text: string;
}

interface WordBubblesProps {
  currentLine: Line | null;
  currentSyllableIndex: number;
  upcomingQueue: UpcomingItem[];
}

export const WordBubbles: React.FC<WordBubblesProps> = ({
  currentLine,
  currentSyllableIndex,
  upcomingQueue,
}) => {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Active Display */}
      <div className="flex flex-wrap justify-center gap-2 max-w-[90%] items-center">
        {currentLine?.syllables.map((s: Syllable, idx: number) => {
          const isCurrent = idx === currentSyllableIndex;
          const isPast = idx < currentSyllableIndex;
          
          return (
            <span
              key={s.id}
              className={`font-sans font-bold px-2 py-1 rounded-[4px] transition-all duration-150 ${
                isCurrent 
                  ? 'text-2xl text-neon-glow bg-neon-muted/20 border border-neon-glow/20 scale-105 shadow-[0_0_12px_rgba(52,213,154,0.1)]' 
                  : isPast 
                    ? 'text-lg text-whiteout' 
                    : 'text-lg text-ash/40'
              }`}
            >
              {s.text}
            </span>
          );
        })}
      </div>

      {/* Upcoming Queue */}
      {upcomingQueue.length > 0 && (
        <div className="flex items-center gap-2 text-[10px] text-ash border-t border-graphite-light pt-2.5 w-[80%] justify-center">
          <span className="font-mono text-[9px] uppercase tracking-wider text-pewter shrink-0">Upcoming:</span>
          {upcomingQueue.map((item, idx) => (
            <span
              key={idx}
              className={`font-sans text-[10px] px-2 py-0.5 rounded-[4px] border ${
                item.type === 'current-line' 
                  ? 'bg-blackout border-graphite-light text-pewter' 
                  : 'bg-neon-muted/5 border-neon-glow/20 text-neon-glow'
              }`}
              style={{ opacity: Math.max(0.2, 0.8 - idx * 0.15) }}
            >
              {item.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
