
import React from 'react';
import { PlayIcon, PauseIcon, ResetIcon } from './Icons';

type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

interface ControlsProps {
  status: TimerStatus;
  onStartPause: () => void;
  onReset: () => void;
}

const Controls: React.FC<ControlsProps> = ({ status, onStartPause, onReset }) => {
  const isFinished = status === 'finished';

  const buttonBaseClasses = "p-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
  const startPauseButtonClasses = `
    ${buttonBaseClasses} 
    ${status === 'running' ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400' : 'bg-teal-500 hover:bg-teal-600 focus:ring-teal-400'}
    shadow-lg shadow-black/30 text-white
  `;
  const resetButtonClasses = `${buttonBaseClasses} bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500`;

  return (
    <div className="flex items-center space-x-6">
      <button 
        onClick={onReset} 
        disabled={status === 'idle'} 
        className={resetButtonClasses}
        aria-label="Reset Timer"
      >
        <ResetIcon className="w-8 h-8" />
      </button>
      
      <button 
        onClick={onStartPause} 
        disabled={isFinished}
        className={startPauseButtonClasses}
        aria-label={status === 'running' ? 'Pause Timer' : 'Start Timer'}
      >
        {status === 'running' ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />}
      </button>

      {isFinished && (
        <div className="absolute bottom-full mb-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-md whitespace-nowrap">
          All laps complete!
        </div>
      )}
    </div>
  );
};

export default Controls;
