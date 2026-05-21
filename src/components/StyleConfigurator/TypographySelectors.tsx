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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ color: 'var(--color-slate-hint)', fontWeight: 600 }}>Font & Layout</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <select
            className="select-styled"
            value={styleConfig.fontFamily}
            onChange={(e) => onStyleChange('fontFamily', e.target.value)}
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
            <option value="Montserrat">Montserrat (Whyte)</option>
            <option value="Space Mono">Space Mono (Whyte Mono)</option>
            <option value="Playfair Display">Playfair Display (GrandSlang)</option>
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier</option>
          </select>

          <select
            className="select-styled"
            value={styleConfig.layoutMode}
            onChange={(e) => onStyleChange('layoutMode', e.target.value as StyleConfig['layoutMode'])}
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
            <option value="classic-2line">Classic 2-Line</option>
            <option value="subtitles">Modern Subtitle</option>
          </select>
        </div>
      </div>

      {/* Text Align & Size */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ color: 'var(--color-slate-hint)', fontSize: '11px' }}>Font Size (px)</label>
          <input
            type="number"
            className="input-styled"
            value={styleConfig.fontSize}
            onChange={(e) => onStyleChange('fontSize', parseInt(e.target.value) || 30)}
            min={20}
            max={80}
            style={{
              background: 'rgba(9, 9, 9, 0.6)',
              border: '1px solid var(--color-steel-accent)',
              borderRadius: 'var(--radius-buttons)',
              padding: '8px 12px',
              color: 'var(--color-cloud-whisper)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ color: 'var(--color-slate-hint)', fontSize: '11px' }}>Alignment</label>
          <select
            className="select-styled"
            value={styleConfig.alignment}
            onChange={(e) => onStyleChange('alignment', e.target.value as StyleConfig['alignment'])}
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
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </>
  );
};
