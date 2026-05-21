import React from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { Download } from 'lucide-react';
import { ProjectSaveLoad } from './ProjectSaveLoad';
import { VideoRecorder } from './VideoRecorder';
import { SubtitleDownloads } from './SubtitleDownloads';

interface ExportPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ videoRef }) => {
  const { lines } = useKaraoke();

  const isSyncReady = lines.length > 0 && lines.some(line => line.startTime !== null);

  return (
    <div className="panel-card">
      <div className="card-title">
        <Download size={16} />
        <span>Publish & Export</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Project JSON Save/Load */}
        <ProjectSaveLoad />

        {/* Video Recorder Block */}
        <VideoRecorder videoRef={videoRef} isSyncReady={isSyncReady} />

        {/* Subtitle Formats Export List */}
        <SubtitleDownloads isSyncReady={isSyncReady} />
      </div>
    </div>
  );
};
