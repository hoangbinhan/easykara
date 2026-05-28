import React, { useRef } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useLanguage } from '../../context/LanguageContext';
import { FileJson, Upload } from 'lucide-react';
import { useKaraokeStore } from '../../store/useKaraokeStore';

export const ProjectSaveLoad: React.FC = () => {
  const { setLines, updateStyleConfig } = useKaraoke(
    React.useCallback(
      (state) => ({
        setLines: state.setLines,
        updateStyleConfig: state.updateStyleConfig,
      }),
      []
    )
  );
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProject = () => {
    const projectData = {
      version: '1.0',
      lines: useKaraokeStore.getState().lines,
      styleConfig: useKaraokeStore.getState().styleConfig,
    };
    const content = JSON.stringify(projectData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'easykara_project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadProjectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const project = JSON.parse(event.target?.result as string);
          if (project.lines && Array.isArray(project.lines)) {
            setLines(project.lines);
            if (project.styleConfig) {
              updateStyleConfig(project.styleConfig);
            }
            alert(t('project.loadSuccess'));
          } else {
            alert(t('project.invalidJson'));
          }
        } catch {
          alert(t('project.readError'));
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={handleSaveProject}
        className="px-3 py-2 bg-graphite hover:bg-graphite-light text-whiteout font-sans text-[11px] font-semibold rounded-full border border-graphite-light hover:border-whiteout transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <FileJson size={13} className="text-neon-glow" />
        <span>{t('project.btnSave')}</span>
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      <button
        onClick={handleLoadProjectClick}
        className="px-3 py-2 bg-graphite hover:bg-graphite-light text-whiteout font-sans text-[11px] font-semibold rounded-full border border-graphite-light hover:border-whiteout transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Upload size={13} className="text-neon-glow" />
        <span>{t('project.btnLoad')}</span>
      </button>
    </div>
  );
};
