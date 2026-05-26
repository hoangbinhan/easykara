import React, { useEffect, useRef } from 'react';
import { useKaraokeStore } from '../../store/useKaraokeStore';
import { formatLRCTime } from '../../utils/timeFormat';

interface HotkeyIndicatorProps {
  isSpacePressed: boolean;
  handleSyncStart: () => void;
  handleSyncEnd: () => void;
  onBackOneWord: () => void;
  onExitSync: () => void;
  spacebarRef: React.RefObject<HTMLDivElement | null>;
}

export const HotkeyIndicator: React.FC<HotkeyIndicatorProps> = ({
  isSpacePressed,
  handleSyncStart,
  handleSyncEnd,
  onBackOneWord,
  onExitSync,
  spacebarRef,
}) => {
  const timeSpanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const unsubscribe = useKaraokeStore.subscribe(
      (state) => state.currentTime,
      (currentTime) => {
        if (timeSpanRef.current) {
          timeSpanRef.current.textContent = `Time: ${formatLRCTime(currentTime)}`;
        }
      }
    );
    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col gap-2 items-center w-full">
      <div
        ref={spacebarRef}
        onMouseDown={handleSyncStart}
        onMouseUp={handleSyncEnd}
        onMouseLeave={handleSyncEnd}
        className={`w-[80%] h-12 rounded-full flex items-center justify-center font-sans text-xs font-bold select-none cursor-pointer transition-all duration-100 ${
          isSpacePressed
            ? 'bg-neon-glow text-graphite-deep scale-[0.98] shadow-[0_0_15px_rgba(52,213,154,0.3)]'
            : 'bg-graphite-deep border border-graphite-light text-whiteout hover:bg-neon-muted/5 scale-100'
        }`}
      >
        {isSpacePressed ? '🎤 HOLDING SPACEBAR (SYNCING...)' : 'PRESS AND HOLD SPACEBAR TO SYNC WORDS'}
      </div>

      <div className="flex justify-between w-[80%] font-mono text-[10px] text-ash">
        <span ref={timeSpanRef}>Time: {formatLRCTime(useKaraokeStore.getState().currentTime)}</span>
        <span>Hotkeys: Enter = Play/Pause | Space = Sync Beat</span>
      </div>

      <div className="flex gap-2 mt-1">
        <button
          onClick={onBackOneWord}
          className="bg-transparent border border-graphite-light text-whiteout text-[11px] px-4 py-1.5 rounded-full hover:bg-neon-muted/10 hover:border-neon-glow transition-all duration-200 cursor-pointer font-sans font-semibold"
        >
          Back 1 Word
        </button>

        <button
          onClick={onExitSync}
          className="bg-transparent border border-system-warning/40 text-system-warning text-[11px] px-4 py-1.5 rounded-full hover:bg-system-warning/10 hover:border-system-warning transition-all duration-200 cursor-pointer font-sans font-semibold"
        >
          Exit Sync Mode
        </button>
      </div>
    </div>
  );
};
