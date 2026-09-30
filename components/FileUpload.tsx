import React, { useState, useCallback } from 'react';
import type { Lap } from '../types';
import { parseExcelFile } from '../services/excelService';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onLapsLoaded: (laps: Lap[]) => void;
  onError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onLapsLoaded, onError }) => {
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsParsing(true);
      onError('');
      try {
        const laps = await parseExcelFile(file);
        onLapsLoaded(laps);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        onError(message);
      } finally {
        setIsParsing(false);
        // Reset file input value to allow re-uploading the same file
        event.target.value = '';
      }
    }
  }, [onLapsLoaded, onError]);

  return (
    <div className="w-full max-w-lg mx-auto p-8 border-2 border-dashed border-gray-600 rounded-2xl text-center bg-gray-800/50 hover:border-teal-400 hover:bg-gray-800 transition-all">
      <div className="flex flex-col items-center justify-center space-y-4">
        <UploadIcon className="w-12 h-12 text-gray-500" />
        <h2 className="text-xl font-semibold">Upload Your Lap Schedule</h2>
        <p className="text-gray-400">
          Drop an Excel (.xlsx, .xls) file here or click to select one.
          <br />
          It must contain 'Tid' (e.g., 0-7) and 'Aktivitet' columns.
        </p>
        <label htmlFor="file-upload" className="cursor-pointer mt-4">
          <span className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-block">
            {isParsing ? 'Parsing...' : 'Select File'}
          </span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            disabled={isParsing}
          />
        </label>
      </div>
    </div>
  );
};

export default FileUpload;