import React, { useRef, useEffect } from 'react';
import './App.css';
import { KaraokeProvider, useKaraoke } from './context/KaraokeContext';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { MediaSelector } from './components/MediaSelector';
import { LyricsInput } from './components/LyricsInput';
import { SyncPanel } from './components/SyncPanel';
import { WaveformTimeline } from './components/WaveformTimeline';
import { StyleConfigurator } from './components/StyleConfigurator';
import { ExportPanel } from './components/ExportPanel';
import { KaraokePreview } from './components/KaraokePreview';
import { Music, Undo2, Redo2, Sparkles } from 'lucide-react';

const EasyKaraAppContent: React.FC = () => {
  const {
    mediaUrl,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useKaraoke();

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

  const handleMediaLoaded = (file: File) => {
    analyzeAudio(file);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-blackout font-sans text-whiteout">
      {/* Stark Premium Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-graphite-light bg-blackout select-none z-10">
        <div className="flex items-center gap-3">
          <Music className="text-neon-glow" size={20} />
          <span className="font-sans text-base font-bold tracking-tight text-whiteout">EasyKara</span>
          <span className="text-[10px] bg-neon-muted/20 border border-neon-muted/40 text-neon-glow px-2 py-0.5 rounded-[4px] font-mono flex items-center gap-1 font-semibold">
            <Sparkles size={10} /> v1.0
          </span>
        </div>

        {/* Global Action Header Controls */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-1.5 bg-blackout border border-graphite-light rounded-[9999px] text-ash text-xs font-semibold font-sans hover:bg-neon-muted/10 hover:border-neon-glow hover:text-whiteout disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={12} />
            <span>Undo</span>
          </button>
          
          <button
            className="flex items-center gap-2 px-4 py-1.5 bg-blackout border border-graphite-light rounded-[9999px] text-ash text-xs font-semibold font-sans hover:bg-neon-muted/10 hover:border-neon-glow hover:text-whiteout disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={12} />
            <span>Redo</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex flex-1 h-[calc(100vh-56px-160px)] overflow-hidden w-full bg-blackout">
        {/* Left Column: Media & Lyrics Input */}
        <div className="w-[340px] min-w-[340px] flex flex-col gap-4 p-4 overflow-y-auto border-r border-graphite-light bg-blackout">
          <MediaSelector onMediaLoaded={handleMediaLoaded} />
          <LyricsInput />
        </div>

        {/* Center Column: Live Preview & Sync Engine */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 overflow-y-auto border-r border-graphite-light bg-blackout">
          {/* Main Canvas Visualizer */}
          <KaraokePreview videoRef={videoRef} />

          {/* Sync Engine Controller */}
          <SyncPanel audioRef={videoRef} />
        </div>

        {/* Right Column: Styling & Publishing */}
        <div className="w-[360px] min-w-[360px] flex flex-col gap-4 p-4 overflow-y-auto bg-blackout">
          <StyleConfigurator />
          <ExportPanel videoRef={videoRef} />
        </div>
      </main>

      {/* Bottom Waveform Timeline Section */}
      <WaveformTimeline
        audioRef={videoRef}
        waveformData={waveformData}
        loadingWaveform={loadingWaveform}
        waveformProgress={waveformProgress}
      />
    </div>
  );
};

function App() {
  return (
    <KaraokeProvider>
      <EasyKaraAppContent />
    </KaraokeProvider>
  );
}

export default App;
