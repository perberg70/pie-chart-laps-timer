import React from 'react';

interface AnalogClockProps {
  totalDuration: number;
  timeLeft: number;
}

const AnalogClock: React.FC<AnalogClockProps> = ({ totalDuration, timeLeft }) => {
  const percentage = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const angle = percentage * 360;

  // Color shifts from green (120) to red (0) as time runs out
  const hue = totalDuration > 0 ? 120 * (timeLeft / totalDuration) : 120;
  const color = `hsl(${hue}, 80%, 55%)`;

  const pieChartStyle = {
    background: `conic-gradient(${color} 0deg ${angle}deg, #374151 ${angle}deg 360deg)`,
  };

  return (
    <div className="relative w-full aspect-square p-4">
      {/* Outer bezel */}
      <div className="w-full h-full rounded-full bg-gray-800 shadow-2xl shadow-black/50 flex items-center justify-center">
        {/* Pie chart layer */}
        <div 
          className="w-full h-full rounded-full transition-all duration-500 ease-linear" 
          style={pieChartStyle}
        >
          {/* Inner circle and ticks removed for a solid pie chart look */}
        </div>
      </div>
    </div>
  );
};

export default AnalogClock;