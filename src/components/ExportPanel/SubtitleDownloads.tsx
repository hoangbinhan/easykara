import React from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Download, AlertCircle } from 'lucide-react';
import { triggerDownload, generateASS, generateLRC, generateSRT } from '../../utils/subtitleGenerators';

interface SubtitleDownloadsProps {
  isSyncReady: boolean;
}

export const SubtitleDownloads: React.FC<SubtitleDownloadsProps> = ({ isSyncReady }) => {
  const { lines, styleConfig } = useKaraoke();
  const { t } = useLanguage();

  const handleExportASS = () => {
    const assText = generateASS(lines, styleConfig);
    if (assText) {
      triggerDownload(assText, 'karaoke_subtitles.ass', 'text/plain');
    }
  };

  const handleExportLRC = () => {
    const lrcText = generateLRC(lines);
    if (lrcText) {
      triggerDownload(lrcText, 'karaoke_lyrics.lrc', 'text/plain');
    }
  };

  const handleExportSRT = () => {
    const srtText = generateSRT(lines);
    if (srtText) {
      triggerDownload(srtText, 'karaoke_subtitles.srt', 'text/plain');
    }
  };

  return (
    <div className="flex flex-col gap-1.5 border-t border-graphite-light pt-2.5">
      <label className="font-sans text-[11px] font-semibold text-ash uppercase tracking-wider">{t('export.titleDownloads')}</label>
      
      <div className="flex flex-col gap-1.5">
        
        {/* ASS Subtitles */}
        <button
          onClick={handleExportASS}
          disabled={!isSyncReady}
          className="w-full px-4 py-2 bg-graphite hover:bg-graphite-light disabled:bg-blackout disabled:opacity-40 disabled:cursor-not-allowed border border-graphite-light hover:border-whiteout disabled:hover:border-graphite-light text-whiteout font-sans text-xs font-semibold rounded-full flex items-center justify-between transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded-[3px] bg-neon-muted text-neon-glow font-mono text-[9px] font-bold uppercase">ASS</span>
            <span>{t('export.formatAss')}</span>
          </div>
          <Download size={12} className="text-neon-glow transition-all" />
        </button>

        {/* LRC Lyrics */}
        <button
          onClick={handleExportLRC}
          disabled={!isSyncReady}
          className="w-full px-4 py-2 bg-graphite hover:bg-graphite-light disabled:bg-blackout disabled:opacity-40 disabled:cursor-not-allowed border border-graphite-light hover:border-whiteout disabled:hover:border-graphite-light text-whiteout font-sans text-xs font-semibold rounded-full flex items-center justify-between transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded-[3px] bg-graphite-light text-whiteout font-mono text-[9px] font-bold uppercase">LRC</span>
            <span>{t('export.formatLrc')}</span>
          </div>
          <Download size={12} className="text-neon-glow transition-all" />
        </button>

        {/* SRT Subtitles */}
        <button
          onClick={handleExportSRT}
          disabled={!isSyncReady}
          className="w-full px-4 py-2 bg-graphite hover:bg-graphite-light disabled:bg-blackout disabled:opacity-40 disabled:cursor-not-allowed border border-graphite-light hover:border-whiteout disabled:hover:border-graphite-light text-whiteout font-sans text-xs font-semibold rounded-full flex items-center justify-between transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded-[3px] bg-graphite-light text-whiteout font-mono text-[9px] font-bold uppercase">SRT</span>
            <span>{t('export.formatSrt')}</span>
          </div>
          <Download size={12} className="text-neon-glow transition-all" />
        </button>
      </div>
      
      {!isSyncReady && (
        <div className="flex gap-1 items-center text-system-warning font-sans text-[10px] mt-1">
          <AlertCircle size={10} className="text-system-warning animate-pulse" />
          <span>{t('export.notReadyWarning')}</span>
        </div>
      )}
    </div>
  );
};
