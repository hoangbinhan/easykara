import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { StyleConfig } from '../../context/KaraokeContext';

interface TypographySelectorsProps {
  styleConfig: StyleConfig;
  onStyleChange: <K extends keyof StyleConfig>(key: K, value: StyleConfig[K]) => void;
}

export const TypographySelectors: React.FC<TypographySelectorsProps> = ({
  styleConfig,
  onStyleChange,
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Style Preset Header */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-[11px] font-semibold text-ash uppercase tracking-wider">
          {t('styleConfigurator.fontAndLayout')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="w-full px-3 py-1.5 bg-blackout border border-graphite-light rounded-[4px] text-whiteout font-sans text-xs focus:border-neon-glow outline-none cursor-pointer transition-colors duration-200"
            value={styleConfig.fontFamily}
            onChange={(e) => onStyleChange('fontFamily', e.target.value)}
          >
            <option value="Montserrat">Montserrat (Whyte)</option>
            <option value="Space Mono">Space Mono (Whyte Mono)</option>
            <option value="Playfair Display">Playfair Display (GrandSlang)</option>
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier</option>
          </select>

          <select
            className="w-full px-3 py-1.5 bg-blackout border border-graphite-light rounded-[4px] text-whiteout font-sans text-xs focus:border-neon-glow outline-none cursor-pointer transition-colors duration-200"
            value={styleConfig.layoutMode}
            onChange={(e) =>
              onStyleChange('layoutMode', e.target.value as StyleConfig['layoutMode'])
            }
          >
            <option value="classic-2line">{t('styleConfigurator.classic2Line')}</option>
            <option value="subtitles">{t('styleConfigurator.subtitleMode')}</option>
          </select>
        </div>
      </div>

      {/* Text Align & Size */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="font-sans text-[10px] text-ash uppercase tracking-wider">
            {t('styleConfigurator.fontSize')}
          </label>
          <input
            type="number"
            className="w-full px-3 py-1.5 bg-blackout border border-graphite-light rounded-[4px] text-whiteout font-sans text-xs focus:border-neon-glow outline-none transition-colors duration-200"
            value={styleConfig.fontSize}
            onChange={(e) => onStyleChange('fontSize', parseInt(e.target.value) || 30)}
            min={20}
            max={80}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-sans text-[10px] text-ash uppercase tracking-wider">
            {t('styleConfigurator.alignment')}
          </label>
          <select
            className="w-full px-3 py-1.5 bg-blackout border border-graphite-light rounded-[4px] text-whiteout font-sans text-xs focus:border-neon-glow outline-none cursor-pointer transition-colors duration-200"
            value={styleConfig.alignment}
            onChange={(e) => onStyleChange('alignment', e.target.value as StyleConfig['alignment'])}
          >
            <option value="left">{t('styleConfigurator.alignLeft')}</option>
            <option value="center">{t('styleConfigurator.alignCenter')}</option>
            <option value="right">{t('styleConfigurator.alignRight')}</option>
          </select>
        </div>
      </div>
    </>
  );
};
