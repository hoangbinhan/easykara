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
    <div className="flex justify-between items-center mb-3.5 w-full">
      <div className="flex items-center gap-3">
        <span className="font-sans text-xs font-semibold uppercase tracking-wider text-neon-glow">
          TIMELINE EDITOR
        </span>
        {loadingWaveform && (
          <span className="font-mono text-[10px] text-neon-glow">
            ⚡ Processing waveform: <strong className="text-whiteout">{waveformProgress}%</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 20}
          className="p-1.5 rounded-full bg-graphite-deep text-whiteout hover:bg-neon-muted/20 border border-graphite-light hover:border-neon-glow transition-all duration-200 cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed flex items-center"
          title="Zoom Out"
        >
          <ZoomOut size={12} />
        </button>
        <span className="font-mono text-[10px] text-ash w-14 text-center font-medium">
          {zoom} px/s
        </span>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= 240}
          className="p-1.5 rounded-full bg-graphite-deep text-whiteout hover:bg-neon-muted/20 border border-graphite-light hover:border-neon-glow transition-all duration-200 cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed flex items-center"
          title="Zoom In"
        >
          <ZoomIn size={12} />
        </button>
      </div>
    </div>
  );
};
