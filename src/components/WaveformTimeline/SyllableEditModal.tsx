import React from 'react';

interface SyllableEditModalProps {
  editingSyl: { lineIdx: number; sylIdx: number; text: string } | null;
  setEditingSyl: (val: { lineIdx: number; sylIdx: number; text: string } | null) => void;
  handleSaveEdit: () => void;
}

export const SyllableEditModal: React.FC<SyllableEditModalProps> = ({
  editingSyl,
  setEditingSyl,
  handleSaveEdit,
}) => {
  if (!editingSyl) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--color-midnight-eclipse)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 'var(--radius-cards)',
        padding: '24px',
        zIndex: 1000,
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <h4 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-cloud-whisper)', margin: 0, letterSpacing: '-0.019em' }}>Edit Syllable</h4>
      <input
        type="text"
        className="input-styled"
        value={editingSyl.text}
        onChange={(e) => setEditingSyl({ ...editingSyl, text: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
        autoFocus
        style={{
          background: 'rgba(9, 9, 9, 0.8)',
          border: '1px solid var(--color-steel-accent)',
          borderRadius: 'var(--radius-buttons)',
          padding: '10px 16px',
          color: 'var(--color-cloud-whisper)',
          fontSize: '14px',
          outline: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setEditingSyl(null)}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-buttons)',
            fontSize: '14px',
            fontWeight: 600,
            background: 'rgba(247, 249, 250, 0.08)',
            border: 'none',
            color: 'var(--color-cloud-whisper)',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSaveEdit}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-buttons)',
            fontSize: '14px',
            fontWeight: 600,
            background: 'var(--color-deep-violet)',
            border: 'none',
            color: 'var(--color-cloud-whisper)',
            cursor: 'pointer',
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};
