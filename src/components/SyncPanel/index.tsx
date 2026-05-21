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
      className={`bg-graphite-deep border rounded-[4px] p-4 flex flex-col gap-4 transition-colors duration-200 hover:border-neon-glow/40 w-full ${
        isRecording ? 'border-neon-glow bg-neon-muted/5' : 'border-graphite-light'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 ${isRecording ? 'text-neon-glow' : 'text-whiteout'}`}>
          <Keyboard size={14} />
          <span className="font-sans text-xs font-semibold uppercase tracking-wider">
            {isRecording ? 'Spacebar Sync Engine (SYNC ACTIVE)' : 'Beat Sync Engine'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="w-20 px-2 py-1 bg-blackout border border-graphite-light rounded-[4px] text-whiteout font-mono text-xs focus:border-neon-glow outline-none cursor-pointer disabled:opacity-20"
            value={playbackRate}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
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
            className={`px-4 py-1.5 rounded-full font-sans text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed ${
              isPlaying
                ? 'bg-transparent text-whiteout border border-neon-glow hover:bg-neon-muted/10'
                : 'bg-whiteout text-graphite-deep hover:bg-cloud'
            }`}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </div>

      <div className="bg-blackout border border-graphite-light rounded-[4px] p-6 min-h-[130px] flex flex-col justify-center items-center gap-4 relative overflow-hidden w-full">
        {!mediaUrl ? (
          <p className="font-sans text-xs text-ash text-center leading-relaxed">
            Please upload an audio or video file to activate the Sync Engine.
          </p>
        ) : isSyncComplete ? (
          <div className="text-center">
            <p className="font-sans text-sm font-semibold text-neon-glow mb-1">
              🎉 Synchronization Complete!
            </p>
            <p className="font-sans text-[11px] text-ash">
              You can listen to the preview, export subtitles, or refine time tags in the timeline.
            </p>
          </div>
        ) : !isRecording ? (
          <div className="text-center flex flex-col gap-3.5">
            <p className="font-sans text-xs text-ash">
              Activate Sync Mode and tap the Spacebar along with the music.
            </p>
            <button
              onClick={handleToggleRecord}
              className="flex items-center gap-1.5 px-5 py-2 bg-whiteout text-graphite-deep font-sans text-xs font-semibold rounded-full hover:bg-cloud transition-all duration-200 cursor-pointer mx-auto"
            >
              <Zap size={12} />
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
