import React, { useState, useRef, useEffect } from 'react';
import { useKaraoke } from '../context/KaraokeContext';
import { Download, Upload, FileJson, Film, Video, Disc, AlertCircle } from 'lucide-react';

interface ExportPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ videoRef }) => {
  const { lines, styleConfig, setLines, updateStyleConfig, mediaUrl } = useKaraoke();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Recording states
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Helpers for time formatting
  const formatASSTime = (secs: number) => {
    if (secs < 0) secs = 0;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const cs = Math.round((secs % 1) * 100);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0').slice(0, 2)}`;
  };

  const formatLRCTime = (secs: number) => {
    if (secs < 0) secs = 0;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const xx = Math.round((secs % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${xx.toString().padStart(2, '0').slice(0, 2)}`;
  };

  const formatSRTTime = (secs: number) => {
    if (secs < 0) secs = 0;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.round((secs % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  // Convert standard CSS Hex (#RRGGBB) to ASS Hex ABGR
  const hexToASSColor = (hex: string) => {
    let r = 'FF', g = 'FF', b = 'FF';
    if (hex.startsWith('#')) {
      if (hex.length === 7) {
        r = hex.substring(1, 3);
        g = hex.substring(3, 5);
        b = hex.substring(5, 7);
      } else if (hex.length === 4) {
        r = hex[1] + hex[1];
        g = hex[2] + hex[2];
        b = hex[3] + hex[3];
      }
    }
    // ASS format: &H00BBGGRR& (ABGR with 00 alpha)
    return `&H00${b}${g}${r}&`;
  };

  // File Download Utility
  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1. Export ASS
  const handleExportASS = () => {
    if (lines.length === 0) return;

    const primaryColorASS = hexToASSColor(styleConfig.fillColor);
    const secondaryColorASS = hexToASSColor(styleConfig.activeColor);
    const outlineColorASS = hexToASSColor(styleConfig.strokeColor);

    let assText = `[Script Info]
Title: EasyKara Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: 1280
PlayResY: 720

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${styleConfig.fontFamily},${styleConfig.fontSize},${primaryColorASS},${secondaryColorASS},${outlineColorASS},&H60000000&,-1,0,0,0,100,100,0,0,1,${styleConfig.strokeWidth},2,5,120,120,80,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    lines.forEach((line) => {
      if (line.startTime === null || line.endTime === null) return;

      const start = formatASSTime(line.startTime);
      const end = formatASSTime(line.endTime);

      // Build syllable karaoke tags
      let lineText = '';
      line.syllables.forEach((syl, sIdx) => {
        if (syl.startTime === null || syl.endTime === null) {
          lineText += syl.text + ' ';
          return;
        }

        // Calculate centi-second duration
        const durationCS = Math.max(1, Math.round((syl.endTime - syl.startTime) * 100));
        
        // Handle gap prefix if there's a gap before first syllable or between syllables
        let gapCS = 0;
        if (sIdx === 0) {
          gapCS = Math.round((syl.startTime - line.startTime!) * 100);
        } else {
          const prevSyl = line.syllables[sIdx - 1];
          if (prevSyl.endTime !== null) {
            gapCS = Math.round((syl.startTime - prevSyl.endTime) * 100);
          }
        }

        if (gapCS > 0) {
          lineText += `{\\k${gapCS}}`;
        }

        lineText += `{\\k${durationCS}}${syl.text} `;
      });

      assText += `Dialogue: 0,${start},${end},Default,,0000,0000,0000,,${lineText.trim()}\n`;
    });

    triggerDownload(assText, 'karaoke_subtitles.ass', 'text/plain');
  };

  // 2. Export LRC (Enhanced Word-by-word)
  const handleExportLRC = () => {
    if (lines.length === 0) return;

    let lrcText = '[ti:EasyKara Lyric]\n[by:EasyKara Web App]\n';

    lines.forEach((line) => {
      if (line.startTime === null) return;
      
      const lineStart = formatLRCTime(line.startTime);
      let lineText = `[${lineStart}]`;

      line.syllables.forEach((syl) => {
        if (syl.startTime === null || syl.endTime === null) {
          lineText += syl.text + ' ';
          return;
        }
        const start = formatLRCTime(syl.startTime);
        lineText += `<${start}>${syl.text} `;
      });

      lrcText += lineText.trim() + '\n';
    });

    triggerDownload(lrcText, 'karaoke_lyrics.lrc', 'text/plain');
  };

  // 3. Export SRT
  const handleExportSRT = () => {
    if (lines.length === 0) return;

    let srtText = '';
    let counter = 1;

    lines.forEach((line) => {
      if (line.startTime === null || line.endTime === null) return;

      const start = formatSRTTime(line.startTime);
      const end = formatSRTTime(line.endTime);

      srtText += `${counter}\n${start} --> ${end}\n${line.text}\n\n`;
      counter++;
    });

    triggerDownload(srtText, 'karaoke_subtitles.srt', 'text/plain');
  };

  // 4. Save Project JSON
  const handleSaveProject = () => {
    const projectData = {
      version: '1.0',
      lines,
      styleConfig,
    };
    triggerDownload(JSON.stringify(projectData, null, 2), 'easykara_project.json', 'application/json');
  };

  // 5. Load Project JSON
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

  // 6. Record Canvas to Video File (BROWSER-SIDE RECORDER)
  const handleStartRecording = async () => {
    const canvas = document.querySelector('canvas');
    const video = videoRef.current;

    if (!canvas || !video || !mediaUrl) {
      alert('Please load a media file before recording.');
      return;
    }

    try {
      setIsRecordingVideo(true);
      setRecordProgress(0);

      // Rewind to start
      video.currentTime = 0;
      video.playbackRate = 1.0; // Force 1.0x speed during capture
      
      // Capture 30fps canvas video stream
      const videoStream = canvas.captureStream(30);
      const combinedTracks: MediaStreamTrack[] = [];

      // Add Canvas Video track
      videoStream.getVideoTracks().forEach(track => combinedTracks.push(track));

      // Capture Audio stream from video element using Web Audio API
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      
      const audioCtx = audioContextRef.current;
      
      // Resume AudioContext if suspended (browser security)
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // Check if we already connected this element (Web Audio constraint)
      let destStream: MediaStream;
      if (!audioDestRef.current) {
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        
        // Split audio: one node to the recorder, one node to the local speakers
        source.connect(dest);
        source.connect(audioCtx.destination);
        
        audioDestRef.current = dest;
        destStream = dest.stream;
      } else {
        destStream = audioDestRef.current.stream;
      }

      // Add Web Audio tracks
      destStream.getAudioTracks().forEach(track => combinedTracks.push(track));

      // Construct a new unified media stream
      const combinedStream = new MediaStream(combinedTracks);

      // Select supported mimeType
      let options = { mimeType: 'video/webm;codecs=vp9,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp8,opus' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }

      const recorder = new MediaRecorder(combinedStream, options);
      mediaRecorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: 'video/webm' });
        const finalUrl = URL.createObjectURL(finalBlob);
        
        // Trigger download of the recorded karaoke video!
        const a = document.createElement('a');
        a.href = finalUrl;
        a.download = 'karaoke_video.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(finalUrl);

        setIsRecordingVideo(false);
        setRecordProgress(0);
      };

      // Play video and start recorder
      video.play();
      recorder.start(100); // chunk every 100ms

      // Setup polling progress
      const interval = setInterval(() => {
        if (video.duration && video.currentTime) {
          const pct = Math.round((video.currentTime / video.duration) * 100);
          setRecordProgress(pct);
          
          if (video.ended || video.currentTime >= video.duration - 0.1) {
            clearInterval(interval);
            recorder.stop();
            video.pause();
          }
        }
      }, 500);

    } catch (e) {
      console.error(e);
      alert('Could not record video. Please try again.');
      setIsRecordingVideo(false);
    }
  };

  const handleStopRecordingVideo = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      videoRef.current?.pause();
    }
  };

  const isSyncReady = lines.length > 0 && lines.some(line => line.startTime !== null);

  return (
    <div className="panel-card">
      <div className="card-title">
        <Download size={16} />
        <span>Publish & Export</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* Project JSON Save/Load */}
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

        {/* Video Recorder Block */}
        <div
          style={{
            border: '1px solid var(--color-steel-accent)',
            background: 'rgba(9, 9, 9, 0.4)',
            borderRadius: 'var(--radius-smallwidgets)',
            padding: '12px',
            marginTop: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-deep-violet)', fontWeight: 700 }}>
            <Film size={14} className="brand-icon" />
            <span>Export to Video File (.webm)</span>
          </div>
          
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Record the live karaoke canvas and merge it with the source audio to download a video directly from your browser!
          </p>

          {!isRecordingVideo ? (
            <button
              onClick={handleStartRecording}
              disabled={!isSyncReady || !mediaUrl}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-buttons)',
                background: isSyncReady && mediaUrl ? 'var(--color-deep-violet)' : 'rgba(255,255,255,0.05)',
                color: isSyncReady && mediaUrl ? 'var(--color-cloud-whisper)' : 'rgba(255,255,255,0.3)',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: isSyncReady && mediaUrl ? 'pointer' : 'not-allowed',
                opacity: isSyncReady && mediaUrl ? 1 : 0.5,
                boxShadow: isSyncReady && mediaUrl ? '0 0 12px rgba(175, 80, 255, 0.3)' : 'none',
              }}
            >
              <Video size={14} />
              <span>Record Karaoke Video</span>
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Progress bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-deep-violet)' }}>
                  <Disc size={12} className="glow-pulse" style={{ color: 'var(--color-deep-violet)', animationDuration: '1s' }} />
                  Recording video...
                </span>
                <span>{recordProgress}%</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${recordProgress}%`, background: 'var(--color-deep-violet)', transition: 'width 0.2s ease' }} />
              </div>
              
              <button
                onClick={handleStopRecordingVideo}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 'var(--radius-buttons)',
                  background: 'var(--danger)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '11px',
                }}
              >
                Stop & Save Video Now
              </button>
            </div>
          )}
        </div>

        {/* Subtitle Formats Export List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>Download Karaoke Subtitles</label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            
            {/* ASS Subtitles */}
            <button
              onClick={handleExportASS}
              disabled={!isSyncReady}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-buttons)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--color-steel-accent)',
                color: isSyncReady ? 'var(--color-cloud-whisper)' : 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                cursor: isSyncReady ? 'pointer' : 'not-allowed',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '2px 4px', borderRadius: '3px', background: 'rgba(175, 80, 255, 0.15)', color: 'var(--color-deep-violet)', fontSize: '9px', fontWeight: 800 }}>ASS</span>
                <span>Aegisub Subtitles (.ass)</span>
              </div>
              <Download size={12} style={{ color: isSyncReady ? 'var(--color-deep-violet)' : 'rgba(255,255,255,0.2)' }} />
            </button>

            {/* LRC Lyrics */}
            <button
              onClick={handleExportLRC}
              disabled={!isSyncReady}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-buttons)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--color-steel-accent)',
                color: isSyncReady ? 'var(--color-cloud-whisper)' : 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                cursor: isSyncReady ? 'pointer' : 'not-allowed',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '2px 4px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--color-cloud-whisper)', fontSize: '9px', fontWeight: 800 }}>LRC</span>
                <span>Synced Lyrics (.lrc)</span>
              </div>
              <Download size={12} style={{ color: isSyncReady ? 'var(--color-deep-violet)' : 'rgba(255,255,255,0.2)' }} />
            </button>

            {/* SRT Subtitles */}
            <button
              onClick={handleExportSRT}
              disabled={!isSyncReady}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-buttons)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--color-steel-accent)',
                color: isSyncReady ? 'var(--color-cloud-whisper)' : 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                cursor: isSyncReady ? 'pointer' : 'not-allowed',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '2px 4px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--color-cloud-whisper)', fontSize: '9px', fontWeight: 800 }}>SRT</span>
                <span>Standard Subtitles (.srt)</span>
              </div>
              <Download size={12} style={{ color: isSyncReady ? 'var(--color-deep-violet)' : 'rgba(255,255,255,0.2)' }} />
            </button>
          </div>
          
          {!isSyncReady && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', color: 'var(--warning)', fontSize: '10px', marginTop: '4px' }}>
              <AlertCircle size={10} />
              <span>Please sync at least one word to enable export!</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
