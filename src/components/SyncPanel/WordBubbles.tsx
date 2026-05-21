import React from 'react';

interface WordBubblesProps {
  currentLine: any;
  currentSyllableIndex: number;
  upcomingQueue: any[];
}

export const WordBubbles: React.FC<WordBubblesProps> = ({
  currentLine,
  currentSyllableIndex,
  upcomingQueue,
}) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      {/* Active Display */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', maxWidth: '90%' }}>
        {currentLine?.syllables.map((s: any, idx: number) => {
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
  );
};
