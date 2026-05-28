import React, { useEffect, useRef } from 'react';
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

export const SyllableBlocks: React.FC<SyllableBlocksProps> = React.memo(
  ({ lines, zoom, handleBlockDrag, handleEditClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      let lastActiveEl: HTMLElement | null = null;

      const unsubscribe = useKaraokeStore.subscribe(
        (state) => state.currentTime,
        (currentTime) => {
          if (!containerRef.current) return;

          const elements = containerRef.current.querySelectorAll('[data-syl-start]');
          let activeEl: HTMLElement | null = null;

          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            const start = parseFloat(el.getAttribute('data-syl-start') || '0');
            const end = parseFloat(el.getAttribute('data-syl-end') || '0');

            if (currentTime >= start && currentTime <= end) {
              activeEl = el;
              break;
            }
          }

          if (activeEl !== lastActiveEl) {
            if (lastActiveEl) {
              lastActiveEl.classList.remove(
                'bg-neon-muted/30',
                'border-neon-glow',
                'shadow-[0_0_10px_rgba(52,213,154,0.15)]'
              );
              lastActiveEl.classList.add('bg-graphite-deep', 'border-graphite-light');
            }
            if (activeEl) {
              activeEl.classList.remove('bg-graphite-deep', 'border-graphite-light');
              activeEl.classList.add(
                'bg-neon-muted/30',
                'border-neon-glow',
                'shadow-[0_0_10px_rgba(52,213,154,0.15)]'
              );
            }
            lastActiveEl = activeEl;
          }
        }
      );

      return unsubscribe;
    }, []);

    const initialTime = useKaraokeStore.getState().currentTime;

    return (
      <div ref={containerRef} className="absolute inset-0 pointer-events-none">
        {lines.map((line, lIdx) =>
          line.syllables.map((syl: Syllable, sIdx: number) => {
            if (syl.startTime === null || syl.endTime === null) return null;

            const left = syl.startTime * zoom;
            const width = (syl.endTime - syl.startTime) * zoom;
            const isActive = initialTime >= syl.startTime && initialTime <= syl.endTime;

            return (
              <div
                key={syl.id}
                data-syl-start={syl.startTime}
                data-syl-end={syl.endTime}
                className={`absolute h-8 bottom-[25px] flex items-center justify-center font-sans text-xs text-whiteout font-bold cursor-grab select-none rounded-[4px] border transition-colors duration-150 pointer-events-auto ${
                  isActive
                    ? 'bg-neon-muted/30 border-neon-glow shadow-[0_0_10px_rgba(52,213,154,0.15)]'
                    : 'bg-graphite-deep border-graphite-light hover:border-ash'
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
                <span className="px-2 truncate pointer-events-none select-none">{syl.text}</span>

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
      </div>
    );
  }
);

SyllableBlocks.displayName = 'SyllableBlocks';
