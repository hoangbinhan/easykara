import React, { useState } from 'react';
import { useKaraoke } from '../context/KaraokeContext';
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
    if (window.confirm('Bạn có chắc chắn muốn xoá dữ liệu sync và đặt lại toàn bộ không?')) {
      resetSync();
      setIsLocked(false);
    }
  };

  return (
    <div className="panel-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} />
          <span>Lời Bài Hát</span>
        </div>
        <button
          onClick={() => setIsLocked(!isLocked)}
          style={{
            background: 'none',
            color: isLocked ? 'var(--primary)' : 'var(--text-dark)',
            display: 'flex',
            alignItems: 'center',
          }}
          title={isLocked ? 'Mở khoá chỉnh sửa lời' : 'Khoá lời tránh chỉnh sửa nhầm'}
        >
          {isLocked ? <Lock size={15} /> : <LockOpen size={15} />}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <textarea
          className="textarea-styled"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          disabled={isLocked}
          placeholder="Nhập lời bài hát tại đây..."
          style={{
            flex: 1,
            minHeight: '140px',
            opacity: isLocked ? 0.7 : 1,
            cursor: isLocked ? 'not-allowed' : 'text',
          }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isLocked ? (
            <button
              onClick={handleApply}
              className="primary-glow-effect"
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <Play size={14} />
              <span>Nạp Lời & Bắt Đầu</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLocked(false)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
              }}
            >
              <LockOpen size={14} />
              <span>Chỉnh Sửa Lời</span>
            </button>
          )}

          <button
            onClick={handleReset}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Đặt lại toàn bộ trạng thái đồng bộ"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            background: 'rgba(0,0,0,0.2)',
            padding: '8px 10px',
            borderRadius: '6px',
            lineHeight: '1.4',
          }}
        >
          💡 <strong>Mẹo:</strong> Nhập dòng chữ bình thường. Khoảng trắng sẽ tự động phân tách các từ để bạn nhấn phím Space đồng bộ từng từ một.
        </div>

        {lines.length > 0 && (
          <div style={{ fontSize: '11px', color: 'var(--primary)' }}>
            📊 Tổng số dòng: <strong>{lines.length}</strong> | Tổng số từ:{' '}
            <strong>{lines.reduce((acc, curr) => acc + curr.syllables.length, 0)}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
