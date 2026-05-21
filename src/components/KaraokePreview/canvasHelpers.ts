import type { Line, StyleConfig } from '../../context/KaraokeContext';

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  line: Line,
  y: number,
  isActive: boolean,
  canvasWidth: number,
  styleConfig: StyleConfig,
  currentTime: number
) => {
  ctx.font = `bold ${styleConfig.fontSize}px "${styleConfig.fontFamily}", sans-serif`;
  ctx.lineWidth = styleConfig.strokeWidth;
  ctx.lineJoin = 'round';
  
  const text = line.text;
  const textWidth = ctx.measureText(text).width;
  
  let startX = (canvasWidth - textWidth) / 2;
  if (styleConfig.alignment === 'left') startX = 120;
  else if (styleConfig.alignment === 'right') startX = canvasWidth - textWidth - 120;

  if (!isActive || line.startTime === null) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.strokeText(text, startX, y);
    ctx.fillText(text, startX, y);
    return;
  }

  let currentX = startX;
  line.syllables.forEach((syl) => {
    const sylWidth = ctx.measureText(syl.text).width;
    const spaceWidth = ctx.measureText(' ').width;

    ctx.fillStyle = styleConfig.fillColor;
    ctx.strokeStyle = styleConfig.strokeColor;
    ctx.strokeText(syl.text, currentX, y);
    ctx.fillText(syl.text, currentX, y);

    let pct = 0;
    if (syl.startTime !== null && syl.endTime !== null) {
      if (currentTime >= syl.endTime) pct = 1;
      else if (currentTime >= syl.startTime) pct = (currentTime - syl.startTime) / (syl.endTime - syl.startTime);
    }

    if (pct > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(currentX - 5, y - styleConfig.fontSize - 15, (sylWidth + 10) * pct, styleConfig.fontSize + 30);
      ctx.clip();
      ctx.fillStyle = styleConfig.activeColor;
      ctx.strokeStyle = styleConfig.strokeColor;
      ctx.strokeText(syl.text, currentX, y);
      ctx.fillText(syl.text, currentX, y);
      ctx.restore();
    }
    currentX += sylWidth + spaceWidth;
  });
};

export const drawBackground = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  styleConfig: StyleConfig,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  mediaType: 'audio' | 'video' | null
) => {
  if (styleConfig.bgType === 'color') {
    ctx.fillStyle = styleConfig.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (styleConfig.bgType === 'video' && videoRef.current && mediaType === 'video') {
    try {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } catch {
      ctx.fillStyle = '#090909';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else if (styleConfig.bgType === 'image' && styleConfig.bgImage) {
    const img = new Image();
    img.src = styleConfig.bgImage;
    try {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } catch {
      ctx.fillStyle = '#090909';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    ctx.fillStyle = '#090909';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(175, 80, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 64) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 64) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
    }
  }
};
