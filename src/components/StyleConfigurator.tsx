import React, { useRef } from 'react';
import { useKaraoke } from '../context/KaraokeContext';
import type { StyleConfig } from '../context/KaraokeContext';
import { Paintbrush, Image as ImageIcon } from 'lucide-react';

export const StyleConfigurator: React.FC = () => {
  const { styleConfig, updateStyleConfig, mediaType } = useKaraoke();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStyleChange = (key: keyof StyleConfig, value: any) => {
    updateStyleConfig({ [key]: value });
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      updateStyleConfig({
        bgType: 'image',
        bgImage: url
      });
    }
  };

  return (
    <div className="panel-card">
      <div className="card-title">
        <Paintbrush size={16} />
        <span>Tùy Chỉnh Thẩm Mỹ</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
        
        {/* Style Preset Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Phông chữ & Định dạng</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <select
              className="select-styled"
              value={styleConfig.fontFamily}
              onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
            >
              <option value="Outfit">Outfit</option>
              <option value="Plus Jakarta Sans">Jakarta Sans</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times Roman</option>
              <option value="Courier New">Courier</option>
              <option value="Impact">Impact</option>
            </select>

            <select
              className="select-styled"
              value={styleConfig.layoutMode}
              onChange={(e) => handleStyleChange('layoutMode', e.target.value)}
            >
              <option value="classic-2line">2 Dòng Song Song</option>
              <option value="subtitles">Chính Giữa Đơn</option>
            </select>
          </div>
        </div>

        {/* Text Align & Size */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Cỡ chữ (px)</label>
            <input
              type="number"
              className="input-styled"
              value={styleConfig.fontSize}
              onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value) || 30)}
              min={20}
              max={80}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Canh lề</label>
            <select
              className="select-styled"
              value={styleConfig.alignment}
              onChange={(e) => handleStyleChange('alignment', e.target.value)}
            >
              <option value="left">Trái (Left)</option>
              <option value="center">Giữa (Center)</option>
              <option value="right">Phải (Right)</option>
            </select>
          </div>
        </div>

        {/* Color controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Bảng Màu Karaoke</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            
            {/* Base Fill Color */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '6px' }}>
              <input
                type="color"
                value={styleConfig.fillColor}
                onChange={(e) => handleStyleChange('fillColor', e.target.value)}
                style={{ width: '24px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px' }}>Chưa hát</span>
            </div>

            {/* Active Sing Color */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '6px' }}>
              <input
                type="color"
                value={styleConfig.activeColor}
                onChange={(e) => handleStyleChange('activeColor', e.target.value)}
                style={{ width: '24px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--secondary)', fontWeight: 700 }}>Đang hát</span>
            </div>

            {/* Stroke Outline Color */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '6px' }}>
              <input
                type="color"
                value={styleConfig.strokeColor}
                onChange={(e) => handleStyleChange('strokeColor', e.target.value)}
                style={{ width: '24px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px' }}>Viền chữ</span>
            </div>

            {/* Stroke Width outline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Độ dày viền: {styleConfig.strokeWidth}px</span>
              <input
                type="range"
                value={styleConfig.strokeWidth}
                onChange={(e) => handleStyleChange('strokeWidth', parseInt(e.target.value))}
                min={0}
                max={12}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

          </div>
        </div>

        {/* Backdrop Visual selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
          <label style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Ảnh / Nền Video</label>
          
          <select
            className="select-styled"
            value={styleConfig.bgType}
            onChange={(e) => handleStyleChange('bgType', e.target.value)}
          >
            <option value="color">Màu sắc đơn sắc</option>
            {mediaType === 'video' && <option value="video">Sử dụng Video gốc làm nền</option>}
            <option value="image">Sử dụng ảnh tùy chỉnh</option>
            <option value="visuals">Đồ họa Neon ảo ảnh</option>
          </select>

          {styleConfig.bgType === 'color' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chọn màu nền:</span>
              <input
                type="color"
                value={styleConfig.bgColor}
                onChange={(e) => handleStyleChange('bgColor', e.target.value)}
                style={{ width: '40px', height: '20px', border: 'none', borderRadius: '4px', background: 'none', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>{styleConfig.bgColor}</span>
            </div>
          )}

          {styleConfig.bgType === 'image' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleBgImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px',
                }}
              >
                <ImageIcon size={14} />
                <span>Chọn ảnh từ máy tính</span>
              </button>
              {styleConfig.bgImage && (
                <div style={{ fontSize: '10px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>✓ Đã nhận ảnh nền thành công!</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
