import React from 'react';
import type { Syllable } from '../../context/KaraokeContext';
import { Edit } from 'lucide-react';

interface SyllableBlocksProps {
  lines: any[];
  currentTime: number;
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
  currentTime,
  zoom,
  handleBlockDrag,
  handleEditClick,
}) => {
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
              style={{
                position: 'absolute',
                left: `${left}px`,
                width: `${width}px`,
                height: '32px',
                bottom: '25px',
                background: isActive
                  ? 'linear-gradient(to bottom, rgba(175, 80, 255, 0.3), rgba(175, 80, 255, 0.5))'
                  : 'rgba(255, 255, 255, 0.05)',
                border: isActive
                  ? '1px solid var(--color-deep-violet)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-buttons)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'var(--color-cloud-whisper)',
                fontWeight: 600,
                cursor: 'grab',
                userSelect: 'none',
              }}
              onMouseDown={(e) => handleBlockDrag(e, lIdx, sIdx, syl, 'move')}
              title={`${syl.text} (${syl.startTime}s - ${syl.endTime}s)`}
            >
              {/* Left Resize Handle */}
              <div
                onMouseDown={(e) => handleBlockDrag(e, lIdx, sIdx, syl, 'resize-start')}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '6px',
                  cursor: 'w-resize',
                  background: 'rgba(255,255,255,0.15)',
                  borderTopLeftRadius: '3px',
                  borderBottomLeftRadius: '3px',
                }}
              />

              {/* Syllable Text */}
              <span
                style={{
                  padding: '0 8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {syl.text}
              </span>

              {/* Small Edit Icon */}
              <button
                onClick={(e) => handleEditClick(lIdx, sIdx, syl, e)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  display: 'none',
                  cursor: 'pointer',
                }}
                className="edit-icon-btn"
              >
                <Edit size={10} />
              </button>

              {/* Right Resize Handle */}
              <div
                onMouseDown={(e) => handleBlockDrag(e, lIdx, sIdx, syl, 'resize-end')}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '6px',
                  cursor: 'e-resize',
                  background: 'rgba(255,255,255,0.15)',
                  borderTopRightRadius: '3px',
                  borderBottomRightRadius: '3px',
                }}
              />
            </div>
          );
        })
      )}
    </>
  );
});

SyllableBlocks.displayName = 'SyllableBlocks';
