import React from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Download } from 'lucide-react';
import { ProjectSaveLoad } from './ProjectSaveLoad';
import { VideoRecorder } from './VideoRecorder';
import { SubtitleDownloads } from './SubtitleDownloads';

interface ExportPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const ExportPanel: React.FC<ExportPanelProps> = React.memo(({ videoRef }) => {
  const isSyncReady = useKaraoke(
    React.useCallback(
      (state) => state.lines.length > 0 && state.lines.some((line) => line.startTime !== null),
      []
    )
  );
  const { t } = useLanguage();

  return (
    <div className="panel-card">
      <div className="card-title">
        <Download size={16} />
        <span>{t('exportPanel.title')}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Project JSON Save/Load */}
        <ProjectSaveLoad />

        {/* Video Recorder Block */}
        <VideoRecorder videoRef={videoRef} isSyncReady={isSyncReady} />

        {/* Subtitle Formats Export List */}
        <SubtitleDownloads isSyncReady={isSyncReady} />
      </div>
    </div>
  );
});

ExportPanel.displayName = 'ExportPanel';
