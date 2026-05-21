import type { Line, StyleConfig } from '../context/KaraokeContext';
import { formatASSTime, formatLRCTime, formatSRTTime, hexToASSColor } from './timeFormat';

export const triggerDownload = (content: string, filename: string, mimeType: string) => {
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

export const generateASS = (lines: Line[], styleConfig: StyleConfig): string => {
  if (lines.length === 0) return '';

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

    let lineText = '';
    line.syllables.forEach((syl, sIdx) => {
      if (syl.startTime === null || syl.endTime === null) {
        lineText += syl.text + ' ';
        return;
      }

      const durationCS = Math.max(1, Math.round((syl.endTime - syl.startTime) * 100));
      
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

  return assText;
};

export const generateLRC = (lines: Line[]): string => {
  if (lines.length === 0) return '';

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

  return lrcText;
};

export const generateSRT = (lines: Line[]): string => {
  if (lines.length === 0) return '';

  let srtText = '';
  let counter = 1;

  lines.forEach((line) => {
    if (line.startTime === null || line.endTime === null) return;

    const start = formatSRTTime(line.startTime);
    const end = formatSRTTime(line.endTime);

    srtText += `${counter}\n${start} --> ${end}\n${line.text}\n\n`;
    counter++;
  });

  return srtText;
};
