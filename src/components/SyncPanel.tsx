import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useKaraoke } from '../context/KaraokeContext';
import { Keyboard, Play, Pause, Zap } from 'lucide-react';

export const SyncPanel: React.FC<{ audioRef: React.RefObject<HTMLAudioElement | null> }> = ({ audioRef }) => {
  const {
    lines,
    currentLineIndex,
    currentSyllableIndex,
    isPlaying,
    setIsPlaying,
    currentTime,
    playbackRate,
    setPlaybackRate,
    isRecording,
    setIsRecording,
    startSyllableSync,
    endSyllableSync,
    mediaUrl,
    jumpToSyllable,
  } = useKaraoke();

  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const spacebarRef = useRef<HTMLDivElement>(null);

  // Big sync helper: current line details
  const currentLine = lines[currentLineIndex];
  
  // Collect a queue of upcoming words
  const getUpcomingQueue = () => {
    if (!currentLine) return [];
    const queue = [];
    
    // Remaining syllables in current line
    for (let i = currentSyllableIndex + 1; i < currentLine.syllables.length; i++) {
      queue.push({ text: currentLine.syllables[i].text, type: 'current-line' });
    }
    
    // Syllables in next line
    const nextLine = lines[currentLineIndex + 1];
    if (nextLine) {
      for (let i = 0; i < Math.min(5, nextLine.syllables.length); i++) {
        queue.push({ text: nextLine.syllables[i].text, type: 'next-line' });
      }
    }
    
    return queue.slice(0, 4); // Limit to 4 items
  };

  const upcomingQueue = getUpcomingQueue();

  const handleSyncStart = useCallback(() => {
    if (!mediaUrl) return;
    
    // Auto-play if paused
    if (!isPlaying && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
    
    if (audioRef.current) {
      startSyllableSync(audioRef.current.currentTime);
    }
    setIsSpacePressed(true);
  }, [isPlaying, mediaUrl, startSyllableSync, setIsPlaying, audioRef]);

  const handleSyncEnd = useCallback(() => {
    if (!mediaUrl || !isSpacePressed) return;
    
    if (audioRef.current) {
      endSyllableSync(audioRef.current.currentTime);
    }
    setIsSpacePressed(false);
  }, [mediaUrl, isSpacePressed, endSyllableSync, audioRef]);

  const handleTogglePlay = useCallback(() => {
    if (!mediaUrl) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  }, [mediaUrl, isPlaying, setIsPlaying, audioRef]);

  // Keyboard listeners for spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRecording) return;
      
      // Target key is Spacebar
      if (e.code === 'Space') {
        e.preventDefault();
        if (e.repeat) return; // Prevent multiple triggers on key repeat
        handleSyncStart();
      }
      
      // Shortcut to play/pause: Enter
      if (e.code === 'Enter') {
        e.preventDefault();
        handleTogglePlay();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isRecording) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        handleSyncEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, handleSyncStart, handleSyncEnd, handleTogglePlay]);

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleToggleRecord = () => {
    if (!mediaUrl) return;
    setIsRecording(!isRecording);
    if (!isRecording && !isPlaying) {
      handleTogglePlay(); // Start playing automatically when entering sync mode
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const isSyncComplete = currentLineIndex >= lines.length || 
    (currentLineIndex === lines.length - 1 && currentSyllableIndex >= currentLine?.syllables.length);

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

        {/* Media Controls */}
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

      {/* Sync Queue Visual Screen */}
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
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            {/* Active Display */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', maxWidth: '90%' }}>
              {currentLine?.syllables.map((s, idx) => {
                const isCurrent = idx === currentSyllableIndex;
                const isPast = idx < currentSyllableIndex;
                
                return (
                  <span
                    key={s.id}
                    style={{
                      fontSize: isCurrent ? '26px' : '20px',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: isCurrent 
                        ? 'var(--color-deep-violet)' 
                        : isPast 
                          ? 'var(--color-cloud-whisper)' 
                          : 'rgba(255, 255, 255, 0.25)',
                      transition: 'all 0.15s ease',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-buttons)',
                      background: isCurrent ? 'rgba(175, 80, 255, 0.15)' : 'transparent',
                    }}
                  >
                    {s.text}
                  </span>
                );
              })}
            </div>

            {/* Upcoming Queue */}
            {upcomingQueue.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: 'var(--color-slate-hint)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '8px',
                  width: '80%',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-slate-hint)' }}>Upcoming:</span>
                {upcomingQueue.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: item.type === 'current-line' ? 'rgba(255,255,255,0.05)' : 'rgba(175, 80, 255, 0.05)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      opacity: 0.8 - idx * 0.15,
                    }}
                  >
                    {item.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Physical Spacebar Press Indicator */}
      {isRecording && mediaUrl && !isSyncComplete && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div
            ref={spacebarRef}
            onMouseDown={handleSyncStart}
            onMouseUp={handleSyncEnd}
            onMouseLeave={handleSyncEnd}
            style={{
              width: '80%',
              height: '48px',
              borderRadius: 'var(--radius-buttons)',
              background: isSpacePressed 
                ? 'var(--color-deep-violet)'
                : 'rgba(247, 249, 250, 0.08)',
              border: isSpacePressed ? '1px solid var(--color-deep-violet)' : '1px solid var(--color-steel-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: '14px',
              color: 'var(--color-cloud-whisper)',
              cursor: 'pointer',
              transform: isSpacePressed ? 'scale(0.98)' : 'scale(1)',
              transition: 'all 0.1s ease',
            }}
          >
            {isSpacePressed ? '🎤 HOLDING SPACEBAR (SYNCING...)' : 'PRESS AND HOLD SPACEBAR TO SYNC WORDS'}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '80%',
              fontSize: '11px',
              color: 'var(--color-slate-hint)',
            }}
          >
            <span>Time: {formatTime(currentTime)}</span>
            <span>Hotkeys: Enter = Play/Pause | Space = Sync Beat</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={() => {
                if (currentSyllableIndex > 0) {
                  // Jump back one syllable
                  endSyllableSync(currentTime); // dummy save
                  const prevIdx = currentSyllableIndex - 1;
                  jumpToSyllable(currentLineIndex, prevIdx);
                } else if (currentLineIndex > 0) {
                  const prevLineIdx = currentLineIndex - 1;
                  const prevLine = lines[prevLineIdx];
                  jumpToSyllable(prevLineIdx, prevLine.syllables.length - 1);
                }
              }}
              style={{
                background: 'rgba(247, 249, 250, 0.08)',
                border: '1px solid var(--color-steel-accent)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-buttons)',
                color: 'var(--color-code-ghost)',
                fontSize: '11px',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
              }}
            >
              Back 1 Word
            </button>

            <button
              onClick={() => {
                setIsRecording(false);
              }}
              style={{
                background: 'rgba(255, 69, 58, 0.1)',
                border: '1px solid rgba(255, 69, 58, 0.2)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-buttons)',
                color: 'var(--danger)',
                fontSize: '11px',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
              }}
            >
              Exit Sync Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
