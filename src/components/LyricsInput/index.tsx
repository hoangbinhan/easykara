import React, { useState } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { FileText, Play, RotateCcw, Lock, LockOpen } from 'lucide-react';

export const LyricsInput: React.FC = () => {
  const { lyricsInput, setLyricsInput, parseLyrics, lines, resetSync } = useKaraoke();
  const [isLocked, setIsLocked] = useState(false);
  const [localText, setLocalText] = useState(lyricsInput);

  const handleApply = () => {
    setLyricsInput(localText);
    parseLyrics(localText);
    setIsLocked(true);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all sync data and reset everything?')) {
      resetSync();
      setIsLocked(false);
    }
  };

  return (
    <div className="panel-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} />
          <span>Lyrics</span>
        </div>
        <button
          onClick={() => setIsLocked(!isLocked)}
          style={{
            background: 'none',
            border: 'none',
            color: isLocked ? 'var(--color-vivid-blue)' : 'var(--color-cool-gray)',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          title={isLocked ? 'Unlock Lyrics Editing' : 'Lock Lyrics to Prevent Edits'}
        >
          {isLocked ? <Lock size={15} /> : <LockOpen size={15} />}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          className="textarea-styled"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          disabled={isLocked}
          placeholder="Enter your song lyrics here..."
          style={{
            flex: 1,
            minHeight: '140px',
            opacity: isLocked ? 0.7 : 1,
            cursor: isLocked ? 'not-allowed' : 'text',
            borderRadius: 'var(--radius-standard)',
            border: '1px solid var(--surface-storm-gray-overlay)',
            background: 'var(--surface-deep-graphite-surface)',
            color: 'var(--color-cloud-white)',
            padding: '12px',
            fontSize: '14px',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isLocked ? (
            <button
              onClick={handleApply}
              style={{
                flex: 1,
                padding: '10px 18px',
                borderRadius: 'var(--radius-buttons)',
                background: 'var(--color-interactive-blue)',
                color: 'var(--color-cloud-white)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <Play size={14} fill="white" />
              <span>Load Lyrics & Start</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLocked(false)}
              style={{
                flex: 1,
                padding: '10px 18px',
                borderRadius: 'var(--radius-buttons)',
                background: 'var(--surface-storm-gray-overlay)',
                border: 'none',
                color: 'var(--color-cloud-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LockOpen size={14} />
              <span>Edit Lyrics</span>
            </button>
          )}

          <button
            onClick={handleReset}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-buttons)',
              background: 'rgba(255, 69, 58, 0.15)',
              border: '1px solid rgba(255, 69, 58, 0.3)',
              color: '#ff453a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Reset All Sync Progress"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <div
          style={{
            fontSize: '12px',
            color: 'var(--color-cool-gray)',
            background: 'var(--surface-deep-graphite-surface)',
            border: '1px solid var(--surface-storm-gray-overlay)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-standard)',
            lineHeight: '1.4',
          }}
        >
          💡 <strong>Tip:</strong> Enter lyrics normally. Spaces automatically split words, enabling word-by-word sync by pressing Space.
        </div>

        {lines.length > 0 && (
          <div style={{ fontSize: '12px', color: 'var(--color-vivid-blue)', fontWeight: 500 }}>
            📊 Total lines: <strong>{lines.length}</strong> | Total words:{' '}
            <strong>{lines.reduce((acc, curr) => acc + curr.syllables.length, 0)}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
