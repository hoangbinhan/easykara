import React from 'react';
import type { StyleConfig } from '../../context/KaraokeContext';

interface TypographySelectorsProps {
  styleConfig: StyleConfig;
  onStyleChange: <K extends keyof StyleConfig>(key: K, value: StyleConfig[K]) => void;
}

export const TypographySelectors: React.FC<TypographySelectorsProps> = ({
  styleConfig,
  onStyleChange,
}) => {
  return (
    <>
      {/* Style Preset Header */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-[11px] font-semibold text-ash uppercase tracking-wider">Font & Layout</label>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="w-full px-3 py-1.5 bg-blackout border border-graphite-light rounded-[4px] text-whiteout font-sans text-xs focus:border-neon-glow outline-none cursor-pointer transition-colors duration-200"
            value={styleConfig.fontFamily}
            onChange={(e) => onStyleChange('fontFamily', e.target.value)}
          >
            <option value="Montserrat">Montserrat (Whyte)</option>
            <option value="Space Mono">Space Mono (Whyte Mono)</option>
            <option value="Playfair Display">Playfair Display (GrandSlang)</option>
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier</option>
          </select>

          <select
            className="w-full px-3 py-1.5 bg-blackout border border-graphite-light rounded-[4px] text-whiteout font-sans text-xs focus:border-neon-glow outline-none cursor-pointer transition-colors duration-200"
            value={styleConfig.layoutMode}
            onChange={(e) => onStyleChange('layoutMode', e.target.value as StyleConfig['layoutMode'])}
          >
            <option value="classic-2line">Classic 2-Line</option>
            <option value="subtitles">Modern Subtitle</option>
          </select>
        </div>
      </div>

      {/* Text Align & Size */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="font-sans text-[10px] text-ash uppercase tracking-wider">Font Size (px)</label>
          <input
            type="number"
            className="w-full px-3 py-1.5 bg-blackout border border-graphite-light rounded-[4px] text-whiteout font-sans text-xs focus:border-neon-glow outline-none transition-colors duration-200"
            value={styleConfig.fontSize}
            onChange={(e) => onStyleChange('fontSize', parseInt(e.target.value) || 30)}
            min={20}
            max={80}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-sans text-[10px] text-ash uppercase tracking-wider">Alignment</label>
          <select
            className="w-full px-3 py-1.5 bg-blackout border border-graphite-light rounded-[4px] text-whiteout font-sans text-xs focus:border-neon-glow outline-none cursor-pointer transition-colors duration-200"
            value={styleConfig.alignment}
            onChange={(e) => onStyleChange('alignment', e.target.value as StyleConfig['alignment'])}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </>
  );
};
