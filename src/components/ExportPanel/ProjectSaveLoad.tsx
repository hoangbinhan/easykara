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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      <button
        onClick={handleSaveProject}
        style={{
          padding: '8px 10px',
          borderRadius: 'var(--radius-buttons)',
          background: 'rgba(247, 249, 250, 0.05)',
          border: '1px solid var(--color-steel-accent)',
          color: 'var(--color-cloud-whisper)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px',
        }}
      >
        <FileJson size={13} style={{ color: 'var(--color-deep-violet)' }} />
        <span>Save Project (.json)</span>
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />

      <button
        onClick={handleLoadProjectClick}
        style={{
          padding: '8px 10px',
          borderRadius: 'var(--radius-buttons)',
          background: 'rgba(247, 249, 250, 0.05)',
          border: '1px solid var(--color-steel-accent)',
          color: 'var(--color-cloud-whisper)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px',
        }}
      >
        <Upload size={13} style={{ color: 'var(--color-deep-violet)' }} />
        <span>Load Project (.json)</span>
      </button>
    </div>
  );
};
