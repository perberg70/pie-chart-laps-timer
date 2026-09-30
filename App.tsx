import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Lap } from './types';
import { parseExcelFile } from './services/excelService';
import AnalogClock from './components/AnalogClock';
import Controls from './components/Controls';
import FileUpload from './components/FileUpload';
import LapDisplay from './components/LapDisplay';

type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export default function App() {
  const [laps, setLaps] = useState<Lap[]>([]);
  const [currentLapIndex, setCurrentLapIndex] = useState<number>(0);
  const [timeLeftInLap, setTimeLeftInLap] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);

  const currentLap = useMemo(() => laps[currentLapIndex], [laps, currentLapIndex]);

  const handleFileLoaded = useCallback((parsedLaps: Lap[]) => {
    if (parsedLaps && parsedLaps.length > 0) {
      setLaps(parsedLaps);
      setCurrentLapIndex(0);
      setTimeLeftInLap(parsedLaps[0].duration);
      setStatus('idle');
      setError(null);
    } else {
      setError("The Excel file is empty or couldn't be parsed correctly. Ensure it has 'Tid' and 'Aktivitet' columns.");
      setLaps([]);
    }
  }, []);

  const handleFileError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setLaps([]);
  }, []);

  const cleanupInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (status !== 'running' || !laps.length) {
      cleanupInterval();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeftInLap(prev => {
        if (prev <= 1) {
          if (currentLapIndex < laps.length - 1) {
            const nextLapIndex = currentLapIndex + 1;
            setCurrentLapIndex(nextLapIndex);
            return laps[nextLapIndex].duration;
          } else {
            setStatus('finished');
            cleanupInterval();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return cleanupInterval;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, laps, currentLapIndex]);

  const handleStartPause = () => {
    if (status === 'running') {
      setStatus('paused');
    } else {
      setStatus('running');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setCurrentLapIndex(0);
    if (laps.length > 0) {
      setTimeLeftInLap(laps[0].duration);
    }
  };
  
  const handleNewFile = () => {
    setLaps([]);
    setStatus('idle');
    setError(null);
    setCurrentLapIndex(0);
    setTimeLeftInLap(0);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-500">
            Pie Chart Lap Timer
          </h1>
          <p className="text-gray-400 mt-2">Visualize your tasks, workouts, or meetings from an Excel sheet.</p>
        </header>

        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-4 text-center" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{error}</span>
            </div>
        )}

        {laps.length === 0 ? (
          <FileUpload onLapsLoaded={handleFileLoaded} onError={handleFileError} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1">
              <LapDisplay laps={laps} currentLapIndex={currentLapIndex} status={status} />
            </div>
            <div className="md:col-span-2 flex flex-col items-center">
              <div className="w-full max-w-md mx-auto mb-6">
                 <AnalogClock 
                    totalDuration={currentLap?.duration ?? 0} 
                    timeLeft={timeLeftInLap} 
                />
              </div>

              <div className="text-center mb-6">
                <p className="text-2xl text-gray-400">{currentLap?.name ?? 'Finished'}</p>
                <p className="text-8xl font-mono font-bold tracking-wider">{formatTime(timeLeftInLap)}</p>
              </div>

              <Controls
                status={status}
                onStartPause={handleStartPause}
                onReset={handleReset}
              />
              <button onClick={handleNewFile} className="mt-4 text-sm text-gray-400 hover:text-white transition-colors">
                Load new file
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}