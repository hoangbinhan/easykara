import React from 'react';
import { Keyboard, Play, Pause, Zap } from 'lucide-react';
import { WordBubbles } from './WordBubbles';
import { HotkeyIndicator } from './HotkeyIndicator';
import { useSyncEngine } from './useSyncEngine';

export const SyncPanel: React.FC<{ audioRef: React.RefObject<HTMLAudioElement | null> }> = ({ audioRef }) => {
  const {
    playbackRate,
    isRecording,
    setIsRecording,
    isPlaying,
    currentTime,
    mediaUrl,
    currentLine,
    upcomingQueue,
    isSpacePressed,
    spacebarRef,
    handleSyncStart,
    handleSyncEnd,
    handleTogglePlay,
    handleRateChange,
    handleToggleRecord,
    handleBackOneWord,
    isSyncComplete,
  } = useSyncEngine(audioRef);

  return (
    <div
      className="panel-card"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: isRecording ? 'rgba(175, 80, 255, 0.05)' : 'var(--surface-frosted-pane)',
        border: isRecording ? '1px solid var(--color-deep-violet)' : '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isRecording ? 'var(--color-deep-violet)' : 'inherit' }}>
          <Keyboard size={18} className={isRecording ? 'brand-icon' : ''} />
          <span style={{ fontSize: '15px', fontWeight: 'var(--font-weight-semibold)', fontFamily: 'var(--font-whyte-inktrap)' }}>
            {isRecording ? 'Spacebar Sync Engine (SYNC ACTIVE)' : 'Beat Sync Engine'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            className="select-styled"
            value={playbackRate}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            style={{
              width: '80px',
              padding: '6px 8px',
              fontSize: '12px',
              background: 'rgba(9, 9, 9, 0.6)',
              border: '1px solid var(--color-steel-accent)',
              borderRadius: 'var(--radius-buttons)',
              color: 'var(--color-cloud-whisper)',
              outline: 'none',
            }}
            disabled={!mediaUrl}
          >
            <option value={0.5}>0.50x</option>
            <option value={0.75}>0.75x</option>
            <option value={1.0}>1.00x</option>
            <option value={1.25}>1.25x</option>
          </select>

          <button
            onClick={handleTogglePlay}
            disabled={!mediaUrl}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-buttons)',
              background: isPlaying ? 'rgba(255, 255, 255, 0.1)' : 'var(--color-deep-violet)',
              color: 'var(--color-cloud-whisper)',
              fontSize: '12px',
              fontWeight: 'var(--font-weight-bold)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: mediaUrl ? 1 : 0.4,
              transition: 'background-color 0.2s ease',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(9, 9, 9, 0.6)',
          border: '1px solid var(--color-steel-accent)',
          borderRadius: 'var(--radius-smallwidgets)',
          padding: '24px',
          minHeight: '130px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {!mediaUrl ? (
          <p style={{ color: 'var(--color-slate-hint)', fontSize: '13px', textAlign: 'center' }}>
            Please upload an audio or video file to activate the Sync Engine.
          </p>
        ) : isSyncComplete ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--success)', fontWeight: 'var(--font-weight-semibold)', fontSize: '16px', marginBottom: '8px' }}>
              🎉 Synchronization Complete!
            </p>
            <p style={{ color: 'var(--color-slate-hint)', fontSize: '12px' }}>
              You can listen to the preview, export subtitles, or refine time tags in the timeline.
            </p>
          </div>
        ) : !isRecording ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-slate-hint)', fontSize: '13px', marginBottom: '12px' }}>
              Activate Sync Mode and tap the Spacebar along with the music.
            </p>
            <button
              onClick={handleToggleRecord}
              style={{
                background: 'var(--color-deep-violet)',
                color: 'var(--color-cloud-whisper)',
                padding: '8px 20px',
                borderRadius: 'var(--radius-buttons)',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: '0 auto',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Zap size={14} />
              <span>Enable Spacebar Sync</span>
            </button>
          </div>
        ) : (
          <WordBubbles
            currentLine={currentLine}
            currentSyllableIndex={currentLine?.syllables.findIndex(s => s.startTime === null) ?? -1}
            upcomingQueue={upcomingQueue}
          />
        )}
      </div>

      {isRecording && mediaUrl && !isSyncComplete && (
        <HotkeyIndicator
          isSpacePressed={isSpacePressed}
          currentTime={currentTime}
          handleSyncStart={handleSyncStart}
          handleSyncEnd={handleSyncEnd}
          onBackOneWord={handleBackOneWord}
          onExitSync={() => setIsRecording(false)}
          spacebarRef={spacebarRef}
        />
      )}
    </div>
  );
};
