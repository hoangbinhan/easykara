/* eslint-disable @typescript-eslint/no-explicit-any */
const ctx: Worker = self as any;

function extractPeaks(channelData: Float32Array, numPeaks: number): Float32Array {
  const dataLength = channelData.length;
  const blockSize = Math.floor(dataLength / numPeaks);
  const peaks = new Float32Array(numPeaks);

  for (let i = 0; i < numPeaks; i++) {
    const start = i * blockSize;
    let max = 0;
    const end = Math.min(start + blockSize, dataLength);
    for (let j = start; j < end; j++) {
      const val = Math.abs(channelData[j]);
      if (val > max) {
        max = val;
      }
    }
    peaks[i] = max;
  }

  // 3-point moving average smoothing
  const smoothPeaks = new Float32Array(numPeaks);
  for (let i = 0; i < numPeaks; i++) {
    const prev = i > 0 ? peaks[i - 1] : 0;
    const curr = peaks[i];
    const next = i < numPeaks - 1 ? peaks[i + 1] : 0;
    smoothPeaks[i] = (prev + curr + next) / 3;
  }

  // Find max peak for normalization
  let maxPeak = 0;
  for (let i = 0; i < numPeaks; i++) {
    if (smoothPeaks[i] > maxPeak) {
      maxPeak = smoothPeaks[i];
    }
  }

  // Normalize to 0..1
  if (maxPeak > 0) {
    for (let i = 0; i < numPeaks; i++) {
      smoothPeaks[i] /= maxPeak;
    }
  }

  return smoothPeaks;
}

ctx.onmessage = (e: MessageEvent<{ channelBuffer: ArrayBuffer; numPeaksList?: number[]; numPeaks?: number }>) => {
  const { channelBuffer, numPeaksList, numPeaks } = e.data;
  
  if (!channelBuffer) {
    ctx.postMessage({ error: 'No channelBuffer provided' });
    return;
  }

  const channelData = new Float32Array(channelBuffer);

  if (numPeaksList && numPeaksList.length > 0) {
    const results: Record<number, ArrayBuffer> = {};
    const transferables: ArrayBuffer[] = [];

    for (const count of numPeaksList) {
      const peaks = extractPeaks(channelData, count);
      const peaksBuf = peaks.buffer as ArrayBuffer;
      results[count] = peaksBuf;
      transferables.push(peaksBuf);
    }

    ctx.postMessage({ peaksMap: results }, transferables);
  } else if (numPeaks && numPeaks > 0) {
    const peaks = extractPeaks(channelData, numPeaks);
    const peaksBuf = peaks.buffer as ArrayBuffer;
    ctx.postMessage({ peaks: peaksBuf }, [peaksBuf]);
  } else {
    ctx.postMessage({ error: 'Invalid numPeaks or numPeaksList parameters' });
  }
};
