
import React from 'react';
import type { Lap } from '../types';

interface LapDisplayProps {
  laps: Lap[];
  currentLapIndex: number;
  status: 'idle' | 'running' | 'paused' | 'finished';
}

const LapDisplay: React.FC<LapDisplayProps> = ({ laps, currentLapIndex, status }) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg max-h-96 overflow-y-auto">
      <h3 className="text-lg font-bold text-gray-300 border-b border-gray-700 pb-2 mb-3">Laps</h3>
      <ul className="space-y-2">
        {laps.map((lap, index) => {
          const isCurrent = index === currentLapIndex;
          const isCompleted = index < currentLapIndex || status === 'finished';
          
          let stateStyles = 'bg-gray-700/50 border-gray-700';
          if (isCurrent && (status === 'running' || status === 'paused')) {
            stateStyles = 'bg-teal-500/20 border-teal-500 ring-2 ring-teal-500/50';
          } else if (isCompleted) {
            stateStyles = 'bg-gray-800 border-gray-700 opacity-60';
          }

          return (
            <li
              key={index}
              className={`flex justify-between items-center p-3 rounded-lg border transition-all duration-300 ${stateStyles}`}
            >
              <div className="flex items-center space-x-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent ? 'bg-teal-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                  {index + 1}
                </span>
                <span className={`font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>
                  {lap.name}
                </span>
              </div>
              <span className="text-sm text-gray-400 font-mono">{formatDuration(lap.duration)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LapDisplay;
