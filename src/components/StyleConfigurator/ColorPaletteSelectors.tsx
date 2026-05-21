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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ color: 'var(--color-slate-hint)', fontWeight: 600 }}>Karaoke Palette</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          
          {/* Base Fill Color */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(9, 9, 9, 0.6)', border: '1px solid var(--color-steel-accent)', padding: '6px 8px', borderRadius: 'var(--radius-buttons)' }}>
            <input
              type="color"
              value={styleConfig.fillColor}
              onChange={(e) => onStyleChange('fillColor', e.target.value)}
              style={{ width: '24px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--color-cloud-whisper)' }}>Upcoming Text</span>
          </div>

          {/* Active Sing Color */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(9, 9, 9, 0.6)', border: '1px solid var(--color-steel-accent)', padding: '6px 8px', borderRadius: 'var(--radius-buttons)' }}>
            <input
              type="color"
              value={styleConfig.activeColor}
              onChange={(e) => onStyleChange('activeColor', e.target.value)}
              style={{ width: '24px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--color-deep-violet)', fontWeight: 700 }}>Active Text</span>
          </div>

          {/* Stroke Outline Color */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(9, 9, 9, 0.6)', border: '1px solid var(--color-steel-accent)', padding: '6px 8px', borderRadius: 'var(--radius-buttons)' }}>
            <input
              type="color"
              value={styleConfig.strokeColor}
              onChange={(e) => onStyleChange('strokeColor', e.target.value)}
              style={{ width: '24px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--color-cloud-whisper)' }}>Stroke Outline</span>
          </div>

          {/* Stroke Width outline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(9, 9, 9, 0.6)', border: '1px solid var(--color-steel-accent)', padding: '6px 8px', borderRadius: 'var(--radius-buttons)' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-slate-hint)' }}>Stroke: {styleConfig.strokeWidth}px</span>
            <input
              type="range"
              value={styleConfig.strokeWidth}
              onChange={(e) => onStyleChange('strokeWidth', parseInt(e.target.value))}
              min={0}
              max={12}
              style={{ width: '100%', accentColor: 'var(--color-deep-violet)', cursor: 'pointer' }}
            />
          </div>

        </div>
      </div>

      {/* Backdrop Visual selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--color-steel-accent)', paddingTop: '10px' }}>
        <label style={{ color: 'var(--color-slate-hint)', fontWeight: 600 }}>Background Source</label>
        
        <select
          className="select-styled"
          value={styleConfig.bgType}
          onChange={(e) => onStyleChange('bgType', e.target.value as StyleConfig['bgType'])}
          style={{
            background: 'rgba(9, 9, 9, 0.6)',
            border: '1px solid var(--color-steel-accent)',
            borderRadius: 'var(--radius-buttons)',
            padding: '8px 12px',
            color: 'var(--color-cloud-whisper)',
            fontSize: '13px',
            outline: 'none',
          }}
        >
          <option value="color">Solid Color</option>
          {mediaType === 'video' && <option value="video">Original Video</option>}
          <option value="image">Custom Image</option>
          <option value="visuals">Celestial Space Grid</option>
        </select>

        {styleConfig.bgType === 'color' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-slate-hint)' }}>Background Color:</span>
            <input
              type="color"
              value={styleConfig.bgColor}
              onChange={(e) => onStyleChange('bgColor', e.target.value)}
              style={{ width: '40px', height: '20px', border: 'none', borderRadius: '4px', background: 'none', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-cloud-whisper)' }}>{styleConfig.bgColor}</span>
          </div>
        )}

        {styleConfig.bgType === 'image' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onBgImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-buttons)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-steel-accent)',
                color: 'var(--color-cloud-whisper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ImageIcon size={14} />
              <span>Choose Image File</span>
            </button>
            {styleConfig.bgImage && (
              <div style={{ fontSize: '12px', color: 'var(--color-deep-violet)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                <span>✓ Background image loaded!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
