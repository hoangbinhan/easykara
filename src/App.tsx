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
    <div className="app-container">
      {/* Premium Header */}
      <header className="app-header">
        <div className="brand">
          <Music className="brand-icon" size={24} />
          <span className="brand-title">EasyKara</span>
          <span
            style={{
              fontSize: '10px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: 'var(--primary)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={10} /> v1.0
          </span>
        </div>

        {/* Global Action Header Controls */}
        <div className="header-controls">
          <button
            className="header-btn"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
            <span>Undo</span>
          </button>
          
          <button
            className="header-btn"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={14} />
            <span>Redo</span>
          </button>
        </div>
      </header>

      {/* Main Columnized Workspace */}
      <main className="workspace">
        {/* Left Column: Media & Lyrics Input */}
        <div className="panel panel-left">
          <MediaSelector onMediaLoaded={handleMediaLoaded} />
          <LyricsInput />
        </div>

        {/* Center Column: Live Preview & Sync Engine */}
        <div className="panel panel-middle">
          {/* Main Canvas Visualizer */}
          <KaraokePreview videoRef={videoRef} />

          {/* Sync Engine Controller */}
          <SyncPanel audioRef={videoRef} />
        </div>

        {/* Right Column: Styling & Publishing */}
        <div className="panel panel-right">
          <StyleConfigurator />
          <ExportPanel videoRef={videoRef} />
        </div>
      </main>

      {/* Bottom Timeline Section */}
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
