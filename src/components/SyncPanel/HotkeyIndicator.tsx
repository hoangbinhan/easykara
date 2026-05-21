import React from 'react';
import { formatLRCTime } from '../../utils/timeFormat';

interface HotkeyIndicatorProps {
  isSpacePressed: boolean;
  currentTime: number;
  handleSyncStart: () => void;
  handleSyncEnd: () => void;
  onBackOneWord: () => void;
  onExitSync: () => void;
  spacebarRef: React.RefObject<HTMLDivElement | null>;
}

export const HotkeyIndicator: React.FC<HotkeyIndicatorProps> = ({
  isSpacePressed,
  currentTime,
  handleSyncStart,
  handleSyncEnd,
  onBackOneWord,
  onExitSync,
  spacebarRef,
}) => {
  return (
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
        <span>Time: {formatLRCTime(currentTime)}</span>
        <span>Hotkeys: Enter = Play/Pause | Space = Sync Beat</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button
          onClick={onBackOneWord}
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
          onClick={onExitSync}
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
  );
};
