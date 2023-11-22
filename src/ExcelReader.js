import React, { useEffect } from 'react';
import Papa from 'papaparse';

function ExcelReader({ onDataLoaded }) {
  useEffect(() => {
    const file = require('./src/data/Assignment_Data.csv');
    Papa.parse(file, {
      download: true,
      complete: (results) => {
        onDataLoaded(results.data);
      },
    });
  }, []);

  return null;
}

export default ExcelReader;
