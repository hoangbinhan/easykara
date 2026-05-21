import React from 'react';
import type { StyleConfig } from '../../context/KaraokeContext';
import { Image as ImageIcon } from 'lucide-react';

interface ColorPaletteSelectorsProps {
  styleConfig: StyleConfig;
  onStyleChange: <K extends keyof StyleConfig>(key: K, value: StyleConfig[K]) => void;
  mediaType: 'audio' | 'video' | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onBgImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ColorPaletteSelectors: React.FC<ColorPaletteSelectorsProps> = ({
  styleConfig,
  onStyleChange,
  mediaType,
  fileInputRef,
  onBgImageUpload,
}) => {
  return (
    <>
      {/* Color controls */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-[11px] font-semibold text-ash uppercase tracking-wider">Karaoke Palette</label>
        <div className="grid grid-cols-2 gap-2">
          
          {/* Base Fill Color */}
          <div className="flex items-center gap-2 bg-blackout border border-graphite-light px-2.5 py-1.5 rounded-[4px]">
            <input
              type="color"
              value={styleConfig.fillColor}
              onChange={(e) => onStyleChange('fillColor', e.target.value)}
              className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded-[4px] p-0 outline-none select-none overflow-hidden"
            />
            <span className="text-[11px] text-whiteout font-sans">Upcoming Text</span>
          </div>

          {/* Active Sing Color */}
          <div className="flex items-center gap-2 bg-blackout border border-graphite-light px-2.5 py-1.5 rounded-[4px]">
            <input
              type="color"
              value={styleConfig.activeColor}
              onChange={(e) => onStyleChange('activeColor', e.target.value)}
              className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded-[4px] p-0 outline-none select-none overflow-hidden"
            />
            <span className="text-[11px] text-neon-glow font-sans font-medium">Active Text</span>
          </div>

          {/* Stroke Outline Color */}
          <div className="flex items-center gap-2 bg-blackout border border-graphite-light px-2.5 py-1.5 rounded-[4px]">
            <input
              type="color"
              value={styleConfig.strokeColor}
              onChange={(e) => onStyleChange('strokeColor', e.target.value)}
              className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded-[4px] p-0 outline-none select-none overflow-hidden"
            />
            <span className="text-[11px] text-whiteout font-sans">Stroke Outline</span>
          </div>

          {/* Stroke Width outline */}
          <div className="flex flex-col gap-1 bg-blackout border border-graphite-light px-2.5 py-1.5 rounded-[4px]">
            <span className="text-[10px] text-ash font-sans uppercase tracking-wider">Stroke: {styleConfig.strokeWidth}px</span>
            <input
              type="range"
              value={styleConfig.strokeWidth}
              onChange={(e) => onStyleChange('strokeWidth', parseInt(e.target.value))}
              min={0}
              max={12}
              className="w-full h-1 bg-graphite rounded-[4px] appearance-none cursor-pointer accent-neon-glow outline-none"
            />
          </div>

        </div>
      </div>

      {/* Backdrop Visual selector */}
      <div className="flex flex-col gap-1.5 border-t border-graphite-light pt-2.5">
        <label className="font-sans text-[11px] font-semibold text-ash uppercase tracking-wider">Background Source</label>
        
        <select
          value={styleConfig.bgType}
          onChange={(e) => onStyleChange('bgType', e.target.value as StyleConfig['bgType'])}
          className="w-full px-3 py-1.5 bg-blackout border border-graphite-light rounded-[4px] text-whiteout font-sans text-xs focus:border-neon-glow outline-none cursor-pointer transition-colors duration-200"
        >
          <option value="color">Solid Color</option>
          {mediaType === 'video' && <option value="video">Original Video</option>}
          <option value="image">Custom Image</option>
          <option value="visuals">Celestial Space Grid</option>
        </select>

        {styleConfig.bgType === 'color' && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-ash font-sans">Background Color:</span>
            <input
              type="color"
              value={styleConfig.bgColor}
              onChange={(e) => onStyleChange('bgColor', e.target.value)}
              className="w-10 h-5 border-0 bg-transparent cursor-pointer rounded-[4px] p-0 outline-none"
            />
            <span className="text-[11px] font-mono text-whiteout">{styleConfig.bgColor}</span>
          </div>
        )}

        {styleConfig.bgType === 'image' && (
          <div className="flex flex-col gap-1.5 mt-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onBgImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 bg-graphite hover:bg-graphite-light text-whiteout font-sans text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 border border-graphite-light hover:border-whiteout transition-all duration-200 cursor-pointer"
            >
              <ImageIcon size={14} />
              <span>Choose Image File</span>
            </button>
            {styleConfig.bgImage && (
              <div className="text-[11px] text-neon-glow flex items-center gap-1 font-sans font-medium mt-0.5">
                <span>✓ Background image loaded!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
