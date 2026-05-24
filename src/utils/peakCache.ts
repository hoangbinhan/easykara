export interface MultiResPeaks {
  overview: number[]; // 1000 peaks
  standard: number[]; // 4000 peaks
  detail: number[];   // 16000 peaks
}

/**
 * Returns the optimal peak array for a given zoom level.
 * - Zoom < 50: 1000 peaks (overview)
 * - 50 <= Zoom < 150: 4000 peaks (standard)
 * - Zoom >= 150: 16000 peaks (detail)
 */
export const getPeaksForZoom = (
  peaksData: { peaks: number[]; multiRes?: MultiResPeaks | null } | null,
  zoom: number
): number[] => {
  if (!peaksData) return [];
  
  const multiRes = peaksData.multiRes;
  if (!multiRes) {
    return peaksData.peaks;
  }

  if (zoom < 50) {
    return multiRes.overview && multiRes.overview.length > 0 ? multiRes.overview : peaksData.peaks;
  } else if (zoom < 150) {
    return multiRes.standard && multiRes.standard.length > 0 ? multiRes.standard : peaksData.peaks;
  } else {
    return multiRes.detail && multiRes.detail.length > 0 ? multiRes.detail : peaksData.peaks;
  }
};
