import type { Lap } from '../types';

// Let TypeScript know that XLSX is available on the window object from the CDN script
declare var XLSX: any;

export const parseExcelFile = (file: File): Promise<Lap[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) {
          throw new Error("Failed to read file.");
        }
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Using `defval: null` ensures empty cells are consistently handled
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        if (json.length === 0) {
            resolve([]);
            return;
        }

        // --- Robust Header and Data Extraction ---
        let headerRowIndex = -1;
        let tidIndex = -1;
        let aktivitetIndex = -1;
        
        // Search for header row in the first 10 rows for efficiency
        for (let i = 0; i < Math.min(json.length, 10); i++) {
            const row = json[i] as any[];
            if (!row) continue; // Skip if row is somehow null

            const headers = row.map(h => String(h || '').toLowerCase().trim());
            const tempTidIndex = headers.indexOf('tid');
            const tempAktivitetIndex = headers.indexOf('aktivitet');

            if (tempTidIndex !== -1 && tempAktivitetIndex !== -1) {
                headerRowIndex = i;
                tidIndex = tempTidIndex;
                aktivitetIndex = tempAktivitetIndex;
                break; // Header found
            }
        }

        if (headerRowIndex === -1) {
            throw new Error("Could not find 'Tid' and 'Aktivitet' columns in the Excel file.");
        }

        const dataRows = json.slice(headerRowIndex + 1);
        // --- End of Robust Header Extraction ---

        const laps: Lap[] = [];
        let currentLap: Lap | null = null;

        for (const row of (dataRows as any[])) {
            if (!row || row.every(cell => cell === null)) {
                continue; // Skip completely empty rows
            }

            const tid = row[tidIndex];
            const aktivitet = row[aktivitetIndex];

            // A new lap starts if the 'Tid' column has content
            if (tid !== null && String(tid).trim() !== '') {
                if (currentLap) {
                    laps.push(currentLap); // Push the completed previous lap
                }
                
                // Handle various dash characters (hyphen, en-dash, em-dash)
                const tidString = String(tid).replace(/[\u2012\u2013\u2014\u2015]/g, '-');
                const timeParts = tidString.split('-').map(s => parseInt(s.trim(), 10));
                
                if (timeParts.length === 2 && !isNaN(timeParts[0]) && !isNaN(timeParts[1])) {
                    const [start, end] = timeParts;
                    const durationInSeconds = (end - start) * 60;

                    if (durationInSeconds > 0) {
                        currentLap = {
                            name: String(aktivitet || '').trim(),
                            duration: durationInSeconds
                        };
                    } else {
                        currentLap = null; // Ignore invalid duration (e.g., 10-5)
                    }
                } else {
                    currentLap = null; // Ignore malformed 'Tid' cell
                }
            } else if (currentLap && aktivitet !== null && String(aktivitet).trim() !== '') {
                // This is a continuation of the previous lap (e.g., a sub-task)
                currentLap.name += ` / ${String(aktivitet).trim()}`;
            }
        }

        if (currentLap) { // Push the very last lap after the loop finishes
            laps.push(currentLap);
        }
        
        resolve(laps);
      } catch (error) {
        if (error instanceof Error) {
            reject(error.message);
        } else {
            reject('An unknown error occurred during file parsing.');
        }
      }
    };

    reader.onerror = () => {
      reject('Failed to read the file.');
    };

    reader.readAsArrayBuffer(file);
  });
};