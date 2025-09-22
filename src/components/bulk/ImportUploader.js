'use client';

import { useState } from 'react';
import Papa from 'papaparse';

export default function ImportUploader() {
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setIsParsing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Parsed CSV data:', results.data);
        // Next step: Add validation and display results
        alert(`${results.data.length} rows parsed. Check the console for data.`);
        setIsParsing(false);
        setFile(null);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('An error occurred while parsing the file.');
        setIsParsing(false);
      },
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Import Questions from CSV</h3>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {file && <p className="mt-2 text-sm text-gray-600">Selected file: {file.name}</p>}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || isParsing}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400"
        >
          {isParsing ? 'Parsing...' : 'Upload and Validate'}
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>Download a <a href="/templates/questions_template.csv" download className="text-indigo-600 hover:underline">sample CSV template</a> to see the required format.</p>
      </div>
    </div>
  );
}
