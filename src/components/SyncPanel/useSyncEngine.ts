import { useEffect, useState, useRef, useCallback } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useKaraokeStore } from '../../store/useKaraokeStore';

export const useSyncEngine = (audioRef: React.RefObject<HTMLAudioElement | null>) => {
  const {
    lines,
    currentLineIndex,
    currentSyllableIndex,
    isPlaying,
    setIsPlaying,
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

  const currentLine = lines[currentLineIndex];
  
  const getUpcomingQueue = useCallback(() => {
    if (!currentLine) return [];
    const queue = [];
    
    for (let i = currentSyllableIndex + 1; i < currentLine.syllables.length; i++) {
      queue.push({ text: currentLine.syllables[i].text, type: 'current-line' });
    }
    
    const nextLine = lines[currentLineIndex + 1];
    if (nextLine) {
      for (let i = 0; i < Math.min(5, nextLine.syllables.length); i++) {
        queue.push({ text: nextLine.syllables[i].text, type: 'next-line' });
      }
    }
    
    return queue.slice(0, 4);
  }, [currentLine, currentSyllableIndex, lines, currentLineIndex]);

  const upcomingQueue = getUpcomingQueue();

  const handleSyncStart = useCallback(() => {
    if (!mediaUrl) return;
    
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRecording) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (e.repeat) return;
        handleSyncStart();
      }
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
      handleTogglePlay();
    }
  };

  const handleBackOneWord = () => {
    if (currentSyllableIndex > 0) {
      const freshTime = useKaraokeStore.getState().currentTime;
      endSyllableSync(freshTime);
      const prevIdx = currentSyllableIndex - 1;
      jumpToSyllable(currentLineIndex, prevIdx);
    } else if (currentLineIndex > 0) {
      const prevLineIdx = currentLineIndex - 1;
      const prevLine = lines[prevLineIdx];
      jumpToSyllable(prevLineIdx, prevLine.syllables.length - 1);
    }
  };

  const isSyncComplete = currentLineIndex >= lines.length || 
    (currentLineIndex === lines.length - 1 && currentSyllableIndex >= currentLine?.syllables.length);

  return {
    lines,
    currentLineIndex,
    currentSyllableIndex,
    isPlaying,
    playbackRate,
    isRecording,
    setIsRecording,
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
  };
};
