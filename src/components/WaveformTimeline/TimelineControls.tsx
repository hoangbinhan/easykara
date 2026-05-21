import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface TimelineControlsProps {
  zoom: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  loadingWaveform: boolean;
  waveformProgress: number;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  zoom,
  handleZoomIn,
  handleZoomOut,
  loadingWaveform,
  waveformProgress,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-cloud-whisper)', letterSpacing: '-0.01em' }}>
          TIMELINE EDITOR
        </span>
        {loadingWaveform && (
          <span style={{ fontSize: '12px', color: 'var(--color-deep-violet)' }}>
            ⚡ Processing waveform: <strong>{waveformProgress}%</strong>
          </span>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 20}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            background: 'rgba(247, 249, 250, 0.08)',
            border: 'none',
            color: 'var(--color-cloud-whisper)',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <ZoomOut size={14} />
        </button>
        <span style={{ fontSize: '12px', color: 'var(--color-slate-hint)', width: '60px', textAlign: 'center', fontWeight: 500 }}>{zoom} px/s</span>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= 240}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            background: 'rgba(247, 249, 250, 0.08)',
            border: 'none',
            color: 'var(--color-cloud-whisper)',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <ZoomIn size={14} />
        </button>
      </div>
    </div>
  );
};
