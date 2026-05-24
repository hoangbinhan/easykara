import React from 'react';

interface TimeGridProps {
  duration: number;
  zoom: number;
  totalWidth: number;
}

export const TimeGrid: React.FC<TimeGridProps> = ({ duration, zoom, totalWidth }) => {
  // Draw vertical markers for each second
  const totalSeconds = Math.ceil(duration);
  const seconds = Array.from({ length: totalSeconds + 1 }, (_, i) => i);

  return (
    <div 
      className="absolute inset-y-0 left-0 pointer-events-none z-0"
      style={{ width: `${totalWidth}px` }}
    >
      {seconds.map(sec => {
        const isFiveSec = sec % 5 === 0;
        return (
          <div
            key={sec}
            className={`absolute inset-y-0 border-l transition-colors duration-200 ${
              isFiveSec ? 'border-graphite-light/35' : 'border-graphite-light/10'
            }`}
            style={{
              left: `${sec * zoom}px`,
            }}
          >
            {isFiveSec && (
              <span className="absolute bottom-1 left-1.5 font-mono text-[8px] text-ash/40 select-none">
                {sec}s
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
