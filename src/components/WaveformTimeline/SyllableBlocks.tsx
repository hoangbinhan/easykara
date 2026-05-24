import React from 'react';
import { useKaraokeStore } from '../../store/useKaraokeStore';
import type { Line, Syllable } from '../../context/KaraokeContext';
import { Edit } from 'lucide-react';

interface SyllableBlocksProps {
  lines: Line[];
  zoom: number;
  handleBlockDrag: (
    e: React.MouseEvent,
    lineIdx: number,
    sylIdx: number,
    syl: Syllable,
    type: 'move' | 'resize-start' | 'resize-end'
  ) => void;
  handleEditClick: (lineIdx: number, sylIdx: number, syl: Syllable, e: React.MouseEvent) => void;
}

export const SyllableBlocks: React.FC<SyllableBlocksProps> = React.memo(({
  lines,
  zoom,
  handleBlockDrag,
  handleEditClick,
}) => {
  const currentTime = useKaraokeStore((state) => state.currentTime);
  return (
    <>
      {lines.map((line, lIdx) =>
        line.syllables.map((syl: Syllable, sIdx: number) => {
          if (syl.startTime === null || syl.endTime === null) return null;
          
          const left = syl.startTime * zoom;
          const width = (syl.endTime - syl.startTime) * zoom;
          const isActive = currentTime >= syl.startTime && currentTime <= syl.endTime;

          return (
            <div
              key={syl.id}
              className={`absolute h-8 bottom-[25px] flex items-center justify-center font-sans text-xs text-whiteout font-bold cursor-grab select-none rounded-[4px] transition-colors duration-150 ${
                isActive
                  ? 'bg-neon-muted/30 border border-neon-glow shadow-[0_0_10px_rgba(52,213,154,0.15)]'
                  : 'bg-graphite-deep border border-graphite-light hover:border-ash'
              }`}
              style={{
                left: `${left}px`,
                width: `${width}px`,
              }}
              onMouseDown={(e) => handleBlockDrag(e, lIdx, sIdx, syl, 'move')}
              title={`${syl.text} (${syl.startTime}s - ${syl.endTime}s)`}
            >
              {/* Left Resize Handle */}
              <div
                onMouseDown={(e) => handleBlockDrag(e, lIdx, sIdx, syl, 'resize-start')}
                className="absolute left-0 top-0 bottom-0 w-1.5 cursor-w-resize bg-whiteout/10 rounded-l-[3px] hover:bg-neon-glow/40 transition-colors"
              />

              {/* Syllable Text */}
              <span className="px-2 truncate pointer-events-none select-none">
                {syl.text}
              </span>

              {/* Small Edit Icon */}
              <button
                onClick={(e) => handleEditClick(lIdx, sIdx, syl, e)}
                className="absolute right-2 bg-transparent border-none text-ash hover:text-neon-glow cursor-pointer hidden edit-icon-btn flex items-center justify-center"
              >
                <Edit size={10} />
              </button>

              {/* Right Resize Handle */}
              <div
                onMouseDown={(e) => handleBlockDrag(e, lIdx, sIdx, syl, 'resize-end')}
                className="absolute right-0 top-0 bottom-0 w-1.5 cursor-e-resize bg-whiteout/10 rounded-r-[3px] hover:bg-neon-glow/40 transition-colors"
              />
            </div>
          );
        })
      )}
    </>
  );
});

SyllableBlocks.displayName = 'SyllableBlocks';
