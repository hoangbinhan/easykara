import React from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { Download, AlertCircle } from 'lucide-react';
import { triggerDownload, generateASS, generateLRC, generateSRT } from '../../utils/subtitleGenerators';

interface SubtitleDownloadsProps {
  isSyncReady: boolean;
}

export const SubtitleDownloads: React.FC<SubtitleDownloadsProps> = ({ isSyncReady }) => {
  const { lines, styleConfig } = useKaraoke();

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
      <label style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>Download Karaoke Subtitles</label>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        
        {/* ASS Subtitles */}
        <button
          onClick={handleExportASS}
          disabled={!isSyncReady}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-buttons)',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--color-steel-accent)',
            color: isSyncReady ? 'var(--color-cloud-whisper)' : 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            cursor: isSyncReady ? 'pointer' : 'not-allowed',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '2px 4px', borderRadius: '3px', background: 'rgba(175, 80, 255, 0.15)', color: 'var(--color-deep-violet)', fontSize: '9px', fontWeight: 800 }}>ASS</span>
            <span>Aegisub Subtitles (.ass)</span>
          </div>
          <Download size={12} style={{ color: isSyncReady ? 'var(--color-deep-violet)' : 'rgba(255,255,255,0.2)' }} />
        </button>

        {/* LRC Lyrics */}
        <button
          onClick={handleExportLRC}
          disabled={!isSyncReady}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-buttons)',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--color-steel-accent)',
            color: isSyncReady ? 'var(--color-cloud-whisper)' : 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            cursor: isSyncReady ? 'pointer' : 'not-allowed',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '2px 4px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--color-cloud-whisper)', fontSize: '9px', fontWeight: 800 }}>LRC</span>
            <span>Synced Lyrics (.lrc)</span>
          </div>
          <Download size={12} style={{ color: isSyncReady ? 'var(--color-deep-violet)' : 'rgba(255,255,255,0.2)' }} />
        </button>

        {/* SRT Subtitles */}
        <button
          onClick={handleExportSRT}
          disabled={!isSyncReady}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-buttons)',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--color-steel-accent)',
            color: isSyncReady ? 'var(--color-cloud-whisper)' : 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            cursor: isSyncReady ? 'pointer' : 'not-allowed',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '2px 4px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--color-cloud-whisper)', fontSize: '9px', fontWeight: 800 }}>SRT</span>
            <span>Standard Subtitles (.srt)</span>
          </div>
          <Download size={12} style={{ color: isSyncReady ? 'var(--color-deep-violet)' : 'rgba(255,255,255,0.2)' }} />
        </button>
      </div>
      
      {!isSyncReady && (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', color: 'var(--warning)', fontSize: '10px', marginTop: '4px' }}>
          <AlertCircle size={10} />
          <span>Please sync at least one word to enable export!</span>
        </div>
      )}
    </div>
  );
};
