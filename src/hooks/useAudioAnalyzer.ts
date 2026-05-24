import { useState, useCallback, useRef } from 'react';
import type { MultiResPeaks } from '../utils/peakCache';
import { useKaraokeStore } from '../store/useKaraokeStore';

export interface WaveformData {
  peaks: number[];
  duration: number;
  sampleRate: number;
  multiRes?: MultiResPeaks;
}

export const useAudioAnalyzer = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const cachedPeaks = useKaraokeStore((state) => state.cachedPeaks);
  const cachePeaks = useKaraokeStore((state) => state.cachePeaks);

  const analyzeAudio = useCallback(async (file: File) => {
    // Terminate any existing worker
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
    const cached = cachedPeaks[cacheKey];

    if (cached) {
      setWaveformData(cached);
      setProgress(100);
      setLoading(false);
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    setWaveformData(null);
    setAudioBuffer(null);

    try {
      // 1. Create AudioContext (compatible with older browsers)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      } catch {
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
      setProgress(80); // Decoded successfully, extracting peaks in background

      // 4. Generate Peaks for Waveform Rendering via Web Worker
      const channelData = decodedBuffer.getChannelData(0); // Use first channel
      const numPeaksList = [1000, 4000, 16000];
      
      // Create a copy of the buffer so the original playable AudioBuffer is not detached/neutered
      const bufferCopy = channelData.slice().buffer;

      const worker = new Worker(
        new URL('../workers/peakWorker.ts', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;

      const peaksMap = await new Promise<Record<number, number[]>>((resolve, reject) => {
        worker.onmessage = (e) => {
          if (e.data.error) {
            reject(new Error(e.data.error));
          } else if (e.data.peaksMap) {
            const map: Record<number, number[]> = {};
            for (const count of numPeaksList) {
              const peaksBuffer = e.data.peaksMap[count] as ArrayBuffer;
              map[count] = Array.from(new Float32Array(peaksBuffer));
            }
            resolve(map);
          } else {
            reject(new Error('Failed to extract peaks.'));
          }
          worker.terminate();
          if (workerRef.current === worker) {
            workerRef.current = null;
          }
        };

        worker.onerror = (err) => {
          reject(err);
          worker.terminate();
          if (workerRef.current === worker) {
            workerRef.current = null;
          }
        };

        // Transfer bufferCopy array buffer
        worker.postMessage({ channelBuffer: bufferCopy, numPeaksList }, [bufferCopy]);
      });

      const parsedWaveformData = {
        peaks: peaksMap[4000], // Keep standard 4000 peaks as main peaks fallback
        duration: decodedBuffer.duration,
        sampleRate: decodedBuffer.sampleRate,
        multiRes: {
          overview: peaksMap[1000],
          standard: peaksMap[4000],
          detail: peaksMap[16000],
        },
      };

      setWaveformData(parsedWaveformData);
      cachePeaks(cacheKey, parsedWaveformData);
      
      setProgress(100);
      setLoading(false);
      audioCtx.close();
    } catch (err) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : 'Could not decode the audio file. Please try another format.';
      setError(errorMsg);
      setLoading(false);
    }
  }, [cachedPeaks, cachePeaks]);

  const clearAnalysis = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
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

