import React, { useRef } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import type { StyleConfig } from '../../context/KaraokeContext';
import { Paintbrush } from 'lucide-react';
import { TypographySelectors } from './TypographySelectors';
import { ColorPaletteSelectors } from './ColorPaletteSelectors';

export const StyleConfigurator: React.FC = () => {
  const { styleConfig, updateStyleConfig, mediaType } = useKaraoke();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStyleChange = <K extends keyof StyleConfig>(key: K, value: StyleConfig[K]) => {
    updateStyleConfig({ [key]: value } as Partial<StyleConfig>);
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
        <span>Canvas Aesthetics</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
        <TypographySelectors
          styleConfig={styleConfig}
          onStyleChange={handleStyleChange}
        />
        
        <ColorPaletteSelectors
          styleConfig={styleConfig}
          onStyleChange={handleStyleChange}
          mediaType={mediaType}
          fileInputRef={fileInputRef}
          onBgImageUpload={handleBgImageUpload}
        />
      </div>
    </div>
  );
};
