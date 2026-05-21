import React, { useRef } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { FileJson, Upload } from 'lucide-react';

export const ProjectSaveLoad: React.FC = () => {
  const { lines, styleConfig, setLines, updateStyleConfig } = useKaraoke();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProject = () => {
    const projectData = {
      version: '1.0',
      lines,
      styleConfig,
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
            alert('Project loaded successfully!');
          } else {
            alert('The JSON file structure is invalid for EasyKara.');
          }
        } catch {
          alert('Could not read the JSON project file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={handleSaveProject}
        className="px-3 py-2 bg-graphite hover:bg-graphite-light text-whiteout font-sans text-[11px] font-semibold rounded-full border border-graphite-light hover:border-whiteout transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <FileJson size={13} className="text-neon-glow" />
        <span>Save Project (.json)</span>
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
        <span>Load Project (.json)</span>
      </button>
    </div>
  );
};
