import React from 'react';
import type { Syllable, StyleConfig } from '../../context/KaraokeContext';

interface DOMSyllableProps {
  syl: Syllable;
  currentTime: number;
  scale: number;
  styleConfig: StyleConfig;
}

export const DOMSyllable: React.FC<DOMSyllableProps> = ({
  syl,
  currentTime,
  scale,
  styleConfig,
}) => {
  let pct = 0;
  if (syl.startTime !== null && syl.endTime !== null) {
    if (currentTime >= syl.endTime) {
      pct = 100;
    } else if (currentTime >= syl.startTime) {
      pct = ((currentTime - syl.startTime) / (syl.endTime - syl.startTime)) * 100;
    }
  }

  const baseFontStyles: React.CSSProperties = {
    fontFamily: styleConfig.fontFamily,
    fontSize: `${styleConfig.fontSize * scale}px`,
    lineHeight: '1.2',
  };

  const strokeWidth = styleConfig.strokeWidth * 2 * scale;

  return (
    <span className="relative inline-block select-none whitespace-pre leading-none">
      {/* 1. Stroke outline layer underneath (renders outline completely behind the text fill) */}
      <span
        className="absolute inset-0 select-none pointer-events-none leading-none"
        style={{
          ...baseFontStyles,
          WebkitTextStroke: `${strokeWidth}px ${styleConfig.strokeColor}`,
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {syl.text}
      </span>

      {/* 2. Text Fill layer on top with GPU-composited background-clip gradient sweep */}
      <span
        className="relative inline-block leading-none select-none pointer-events-none transition-[background-position] duration-100 ease-out"
        style={{
          ...baseFontStyles,
          backgroundImage: `linear-gradient(to right, ${styleConfig.activeColor}, ${styleConfig.activeColor} 50%, ${styleConfig.fillColor} 50%)`,
          backgroundSize: '200% 100%',
          backgroundPositionX: `${100 - pct}%`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
        }}
      >
        {syl.text}
      </span>
    </span>
  );
};
