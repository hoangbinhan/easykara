import React, { useRef, useEffect, useCallback } from 'react';
import './App.css';
import { KaraokeProvider, useKaraoke } from './context/KaraokeContext';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { useLayoutResize } from './hooks/useLayoutResize';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { MediaSelector } from './components/MediaSelector';
import { LyricsInput } from './components/LyricsInput';
import { SyncPanel } from './components/SyncPanel';
import { WaveformTimeline } from './components/WaveformTimeline';
import { StyleConfigurator } from './components/StyleConfigurator';
import { ExportPanel } from './components/ExportPanel';
import { KaraokePreview } from './components/KaraokePreview';
import { Music, Undo2, Redo2, Sparkles } from 'lucide-react';

const EasyKaraAppContent: React.FC = () => {
  const { mediaUrl, undo, redo, canUndo, canRedo, tracks, updateTrackWaveformData } = useKaraoke(
    useCallback(
      (state) => ({
        mediaUrl: state.mediaUrl,
        undo: state.undo,
        redo: state.redo,
        canUndo: state.canUndo,
        canRedo: state.canRedo,
        tracks: state.tracks,
        updateTrackWaveformData: state.updateTrackWaveformData,
      }),
      []
    )
  );

  const { t, language, setLanguage } = useLanguage();

  const {
    leftWidth,
    rightWidth,
    timelineHeight,
    isDraggingLeft,
    isDraggingRight,
    isDraggingTimeline,
    startResizeLeft,
    startResizeRight,
    startResizeTimeline,
  } = useLayoutResize();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Waveform Audio Analyzer
  const {
    loading: loadingWaveform,
    progress: waveformProgress,
    waveformData,
    analyzeAudio,
    clearAnalysis,
  } = useAudioAnalyzer();

  // Clear analysis when media is cleared
  useEffect(() => {
    if (!mediaUrl) {
      clearAnalysis();
    }
  }, [mediaUrl, clearAnalysis]);

  // Sync waveformData to the last added track
  useEffect(() => {
    if (waveformData && tracks.length > 0) {
      const lastTrack = tracks[tracks.length - 1];
      if (lastTrack && !lastTrack.waveformData) {
        updateTrackWaveformData(lastTrack.id, waveformData);
      }
    }
  }, [waveformData, tracks, updateTrackWaveformData]);

  const handleMediaLoaded = useCallback(
    (file: File) => {
      analyzeAudio(file);
    },
    [analyzeAudio]
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-blackout font-sans text-whiteout">
      {/* Stark Premium Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-graphite-light bg-blackout select-none z-10">
        <div className="flex items-center gap-3">
          <Music className="text-neon-glow" size={20} />
          <span className="font-sans text-base font-bold tracking-tight text-whiteout">
            {t('header.title')}
          </span>
          <span className="text-[10px] bg-neon-muted/20 border border-neon-muted/40 text-neon-glow px-2 py-0.5 rounded-[4px] font-mono flex items-center gap-1 font-semibold">
            <Sparkles size={10} /> v1.0
          </span>
        </div>

        {/* Global Action Header Controls */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-2.5 py-1 bg-blackout border border-graphite-light rounded-[4px] text-ash font-mono text-xs focus:border-neon-glow hover:text-whiteout outline-none cursor-pointer transition-colors duration-200 mr-2"
          >
            <option value="en">EN</option>
            <option value="vi">VI</option>
          </select>

          <button
            className="flex items-center gap-2 px-4 py-1.5 bg-blackout border border-graphite-light rounded-[9999px] text-ash text-xs font-semibold font-sans hover:bg-neon-muted/10 hover:border-neon-glow hover:text-whiteout disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
            onClick={undo}
            disabled={!canUndo}
            title={`${t('header.undo')} (Ctrl+Z)`}
          >
            <Undo2 size={12} />
            <span>{t('header.undo')}</span>
          </button>

          <button
            className="flex items-center gap-2 px-4 py-1.5 bg-blackout border border-graphite-light rounded-[9999px] text-ash text-xs font-semibold font-sans hover:bg-neon-muted/10 hover:border-neon-glow hover:text-whiteout disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
            onClick={redo}
            disabled={!canRedo}
            title={`${t('header.redo')} (Ctrl+Y)`}
          >
            <Redo2 size={12} />
            <span>{t('header.redo')}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main
        className="flex flex-1 overflow-hidden w-full bg-blackout"
        style={{ height: `calc(100vh - 56px - ${timelineHeight}px)` }}
      >
        {/* Left Column: Media & Lyrics Input */}
        <div
          className="flex flex-col gap-4 p-4 overflow-y-auto bg-blackout"
          style={{
            width: `${leftWidth}px`,
            minWidth: `${leftWidth}px`,
            maxWidth: `${leftWidth}px`,
          }}
        >
          <MediaSelector onMediaLoaded={handleMediaLoaded} />
          <LyricsInput />
        </div>

        {/* Left Resizer Handle */}
        <div
          className={`w-[4px] -mx-[2px] cursor-col-resize hover:bg-neon-glow select-none transition-colors duration-150 relative z-20 ${
            isDraggingLeft ? 'bg-neon-glow' : 'bg-transparent'
          }`}
          onMouseDown={startResizeLeft}
        >
          <div
            className={`absolute inset-y-0 left-[1px] right-[2px] transition-colors duration-150 ${
              isDraggingLeft ? 'bg-neon-glow' : 'bg-graphite-light'
            }`}
          />
        </div>

        {/* Center Column: Live Preview & Sync Engine */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 overflow-y-auto bg-blackout">
          {/* Main Canvas Visualizer */}
          <KaraokePreview videoRef={videoRef} />

          {/* Sync Engine Controller */}
          <SyncPanel audioRef={videoRef} />
        </div>

        {/* Right Resizer Handle */}
        <div
          className={`w-[4px] -mx-[2px] cursor-col-resize hover:bg-neon-glow select-none transition-colors duration-150 relative z-20 ${
            isDraggingRight ? 'bg-neon-glow' : 'bg-transparent'
          }`}
          onMouseDown={startResizeRight}
        >
          <div
            className={`absolute inset-y-0 left-[1px] right-[2px] transition-colors duration-150 ${
              isDraggingRight ? 'bg-neon-glow' : 'bg-graphite-light'
            }`}
          />
        </div>

        {/* Right Column: Styling & Publishing */}
        <div
          className="flex flex-col gap-4 p-4 overflow-y-auto bg-blackout"
          style={{
            width: `${rightWidth}px`,
            minWidth: `${rightWidth}px`,
            maxWidth: `${rightWidth}px`,
          }}
        >
          <StyleConfigurator />
          <ExportPanel videoRef={videoRef} />
        </div>
      </main>

      {/* Timeline Resizer Handle */}
      <div
        className={`h-[4px] -my-[2px] cursor-row-resize hover:bg-neon-glow select-none transition-colors duration-150 relative z-20 ${
          isDraggingTimeline ? 'bg-neon-glow' : 'bg-transparent'
        }`}
        onMouseDown={startResizeTimeline}
      >
        <div
          className={`absolute inset-x-0 top-[1px] bottom-[2px] transition-colors duration-150 ${
            isDraggingTimeline ? 'bg-neon-glow' : 'bg-graphite-light'
          }`}
        />
      </div>

      {/* Bottom Waveform Timeline Section */}
      <WaveformTimeline
        audioRef={videoRef}
        waveformData={waveformData}
        loadingWaveform={loadingWaveform}
        waveformProgress={waveformProgress}
        height={timelineHeight}
      />
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <KaraokeProvider>
        <EasyKaraAppContent />
      </KaraokeProvider>
    </LanguageProvider>
  );
}

export default App;
