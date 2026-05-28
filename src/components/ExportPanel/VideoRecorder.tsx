import React from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Film, Video, Disc } from 'lucide-react';
import { useVideoRecorder } from './useVideoRecorder';

interface VideoRecorderProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isSyncReady: boolean;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ videoRef, isSyncReady }) => {
  const mediaUrl = useKaraoke(React.useCallback((state) => state.mediaUrl, []));
  const { t } = useLanguage();
  const { isRecordingVideo, recordProgress, handleStartRecording, handleStopRecordingVideo } =
    useVideoRecorder({ videoRef, mediaUrl });

  return (
    <div className="border border-graphite-light bg-blackout px-3 py-3 rounded-[4px] flex flex-col gap-2 mt-1">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-neon-glow font-sans">
        <Film size={14} />
        <span>{t('videoExport.title')}</span>
      </div>

      <p className="text-[11px] text-ash font-sans leading-normal">{t('videoExport.desc')}</p>

      {!isRecordingVideo ? (
        <button
          onClick={handleStartRecording}
          disabled={!isSyncReady || !mediaUrl}
          className="w-full px-4 py-2 font-sans font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer bg-whiteout hover:bg-cloud text-graphite-deep disabled:bg-graphite disabled:text-ash disabled:border disabled:border-graphite-light disabled:cursor-not-allowed"
        >
          <Video size={14} />
          <span>{t('videoExport.btnRecord')}</span>
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-sans text-whiteout">
            <span className="flex items-center gap-1.5 text-neon-glow">
              <Disc size={12} className="animate-spin text-neon-glow" />
              {t('videoExport.statusRecording')}
            </span>
            <span className="font-mono">{recordProgress}%</span>
          </div>
          <div className="h-1.5 w-full bg-graphite rounded-[4px] overflow-hidden">
            <div
              className="h-full bg-neon-glow transition-all duration-200"
              style={{ width: `${recordProgress}%` }}
            />
          </div>

          <button
            onClick={handleStopRecordingVideo}
            className="w-full px-4 py-1.5 bg-system-warning hover:bg-red-600 text-whiteout font-sans font-semibold text-[11px] rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center"
          >
            {t('videoExport.btnStopSave')}
          </button>
        </div>
      )}
    </div>
  );
};
