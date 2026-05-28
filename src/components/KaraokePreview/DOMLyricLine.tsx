import React from 'react';
import type { Line, StyleConfig } from '../../context/KaraokeContext';
import { DOMSyllable } from './DOMSyllable';

interface DOMLyricLineProps {
  line: Line;
  currentTime: number;
  scale: number;
  styleConfig: StyleConfig;
  isActive: boolean;
}

export const DOMLyricLine: React.FC<DOMLyricLineProps> = ({
  line,
  currentTime,
  scale,
  styleConfig,
  isActive,
}) => {
  const baseFontStyles: React.CSSProperties = {
    fontFamily: styleConfig.fontFamily,
    fontSize: `${styleConfig.fontSize * scale}px`,
    lineHeight: '1.2',
  };

  const strokeWidth = styleConfig.strokeWidth * 2 * scale;

  // Optimised low-cost text layer for inactive lines
  if (!isActive || line.startTime === null) {
    return (
      <div className="relative inline-block select-none leading-none">
        {/* Stroke outline */}
        <span
          className="absolute inset-0 select-none pointer-events-none leading-none"
          style={{
            ...baseFontStyles,
            WebkitTextStroke: `${strokeWidth}px rgba(0, 0, 0, 0.5)`,
            color: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          {line.text}
        </span>
        {/* Color fill */}
        <span
          style={{
            ...baseFontStyles,
            color: 'rgba(255, 255, 255, 0.4)',
          }}
          className="relative leading-none"
        >
          {line.text}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center leading-none">
      {line.syllables.map((syl) => (
        <DOMSyllable
          key={syl.id}
          syl={syl}
          currentTime={currentTime}
          scale={scale}
          styleConfig={styleConfig}
        />
      ))}
    </div>
  );
};
