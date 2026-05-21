import { useState, useCallback } from 'react';

export interface WaveformData {
  peaks: number[];
  duration: number;
  sampleRate: number;
}

export const useAudioAnalyzer = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const analyzeAudio = useCallback(async (file: File) => {
    setLoading(true);
    setProgress(0);
    setError(null);
    setWaveformData(null);
    setAudioBuffer(null);

    try {
      // 1. Create AudioContext (compatible with older browsers)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API is not supported in your browser.');
      }
      
      const audioCtx = new AudioContextClass();
      
      // 2. Read file as ArrayBuffer
      const reader = new FileReader();
      
      const arrayBufferPromise = new Promise<ArrayBuffer>((resolve, reject) => {
        reader.onload = (e) => {
          if (e.target?.result instanceof ArrayBuffer) {
            resolve(e.target.result);
          } else {
            reject(new Error('Failed to read file as ArrayBuffer'));
          }
        };
        reader.onerror = () => reject(new Error('File reader error'));
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 30); // Use 0-30% for file loading
            setProgress(pct);
          }
        };
        reader.readAsArrayBuffer(file);
      });

      const arrayBuffer = await arrayBufferPromise;
      setProgress(35); // File loaded, starting decoding

      // 3. Decode audio data
      // Using modern promise-based decodeAudioData if available, fallback to callback
      let decodedBuffer: AudioBuffer;
      try {
        decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      } catch (err) {
        // Fallback for some browsers
        decodedBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
          audioCtx.decodeAudioData(
            arrayBuffer,
            (buffer) => resolve(buffer),
            (error) => reject(error)
          );
        });
      }
      
      setAudioBuffer(decodedBuffer);
      setProgress(80); // Decoded successfully, extracting peaks

      // 4. Generate Peaks for Waveform Rendering
      // We will generate an array of peak values (absolute max amplitude)
      // The length of the array depends on the audio length (e.g. 100 peaks per second for details, or 2000 points total)
      const channelData = decodedBuffer.getChannelData(0); // Use first channel
      const numPeaks = 4000; // Number of points to render
      const blockSize = Math.floor(channelData.length / numPeaks);
      const peaks: number[] = [];

      for (let i = 0; i < numPeaks; i++) {
        const start = i * blockSize;
        let max = 0;
        for (let j = 0; j < blockSize; j++) {
          const val = Math.abs(channelData[start + j]);
          if (val > max) {
            max = val;
          }
        }
        peaks.push(max);
      }

      // Smooth peaks a bit to make it look nicer
      const smoothPeaks = peaks.map((val, idx) => {
        const prev = peaks[idx - 1] || 0;
        const next = peaks[idx + 1] || 0;
        return (prev + val + next) / 3;
      });

      // Normalize peaks to 0..1
      const maxPeak = Math.max(...smoothPeaks);
      const normalizedPeaks = maxPeak > 0 ? smoothPeaks.map(p => p / maxPeak) : smoothPeaks;

      setWaveformData({
        peaks: normalizedPeaks,
        duration: decodedBuffer.duration,
        sampleRate: decodedBuffer.sampleRate,
      });
      
      setProgress(100);
      setLoading(false);
      audioCtx.close();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Không thể giải mã tệp âm thanh. Vui lòng chọn tệp định dạng khác.');
      setLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setWaveformData(null);
    setAudioBuffer(null);
    setError(null);
    setProgress(0);
    setLoading(false);
  }, []);

  return {
    loading,
    progress,
    error,
    waveformData,
    audioBuffer,
    analyzeAudio,
    clearAnalysis,
  };
};
