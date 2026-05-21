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
  }, [isRecording, handleSyncStart, handleSyncEnd]);

  const handleTogglePlay = () => {
    if (!mediaUrl) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

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
      className="glass-panel glow-pulse"
      style={{
        width: '100%',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: isRecording ? 'rgba(139, 92, 246, 0.08)' : 'rgba(13, 15, 28, 0.45)',
        border: isRecording ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid var(--border-color)',
        animationDuration: isRecording ? '3s' : '0s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isRecording ? 'var(--primary)' : 'inherit' }}>
          <Keyboard size={18} className={isRecording ? 'brand-icon' : ''} />
          <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            {isRecording ? 'Bộ Đồng Bộ Spacebar (ĐANG SYNC)' : 'Bộ Đồng Bộ Nhịp'}
          </span>
        </div>

        {/* Media Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            className="select-styled"
            value={playbackRate}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            style={{ width: '80px', padding: '4px 8px', fontSize: '12px' }}
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
              padding: '6px 12px',
              borderRadius: '6px',
              background: isPlaying ? 'rgba(255, 255, 255, 0.1)' : 'var(--primary)',
              color: 'white',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: mediaUrl ? 1 : 0.5,
            }}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'Tạm dừng' : 'Chạy'}</span>
          </button>
        </div>
      </div>

      {/* Sync Queue Visual Screen */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
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
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
            Vui lòng tải lên một tệp âm thanh hoặc video để kích hoạt Bộ Đồng bộ.
          </p>
        ) : isSyncComplete ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
              🎉 Đồng bộ hoàn tất!
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Bạn có thể nghe lại, xuất file phụ đề hoặc tinh chỉnh mốc thời gian ở Timeline.
            </p>
          </div>
        ) : !isRecording ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
              Bật chế độ Đồng bộ và nhấn giữ Spacebar theo nhịp điệu bài hát.
            </p>
            <button
              onClick={handleToggleRecord}
              className="primary-glow-effect"
              style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: '0 auto',
              }}
            >
              <Zap size={14} />
              <span>Bật Sync Phím Space</span>
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
                      fontWeight: isCurrent ? '800' : '500',
                      color: isCurrent 
                        ? 'var(--secondary)' 
                        : isPast 
                          ? 'var(--primary)' 
                          : 'rgba(255, 255, 255, 0.4)',
                      textShadow: isCurrent 
                        ? '0 0 15px var(--secondary-glow)' 
                        : isPast 
                          ? '0 0 5px rgba(139, 92, 246, 0.3)' 
                          : 'none',
                      transition: 'all 0.15s ease',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      background: isCurrent ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
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
                  color: 'var(--text-muted)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '8px',
                  width: '80%',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-dark)' }}>Sắp tới:</span>
                {upcomingQueue.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: item.type === 'current-line' ? 'rgba(255,255,255,0.05)' : 'rgba(139, 92, 246, 0.05)',
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
              borderRadius: '10px',
              background: isSpacePressed 
                ? 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)'
                : 'linear-gradient(135deg, rgba(22, 25, 49, 0.8) 0%, rgba(30, 34, 64, 0.8) 100%)',
              border: isSpacePressed ? '1px solid var(--secondary)' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              color: isSpacePressed ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              boxShadow: isSpacePressed ? '0 0 25px var(--secondary-glow)' : 'none',
              transform: isSpacePressed ? 'scale(0.98)' : 'scale(1)',
              transition: 'all 0.1s ease',
            }}
          >
            {isSpacePressed ? '🎤 ĐANG GIỮ SPACE (SYNCING...)' : 'NHẤN VÀ GIỮ PHÍM SPACE ĐỂ CHẠY CHỮ'}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '80%',
              fontSize: '11px',
              color: 'var(--text-dark)',
            }}
          >
            <span>Thời gian: {formatTime(currentTime)}</span>
            <span>Phím tắt: Enter = Chạy/Dừng | Space = Sync nhịp</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={() => {
                if (currentSyllableIndex > 0) {
                  // Jump back one syllable
                  endSyllableSync(currentTime); // dummy save
                  const prevIdx = currentSyllableIndex - 1;
                  // Handle rewind logic or simply decrement index
                  jumpToSyllable(currentLineIndex, prevIdx);
                } else if (currentLineIndex > 0) {
                  const prevLineIdx = currentLineIndex - 1;
                  const prevLine = lines[prevLineIdx];
                  jumpToSyllable(prevLineIdx, prevLine.syllables.length - 1);
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                fontSize: '11px',
              }}
            >
              Quay lại 1 từ
            </button>

            <button
              onClick={() => {
                setIsRecording(false);
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '4px 10px',
                borderRadius: '6px',
                color: 'var(--danger)',
                fontSize: '11px',
              }}
            >
              Thoát Chế độ Sync
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
