import React, { useState } from 'react';

export const metadata = {
  id: 'json-table-viewer',
  name: 'JSON Table Viewer',
  description: 'View JSON array as a table and export to CSV',
  category: 'viewer'
};

const EXAMPLES = {
  users: {
    label: 'Users List',
    data: [
      { "id": 1, "name": "Alice", "email": "alice@example.com", "role": "admin" },
      { "id": 2, "name": "Bob", "email": "bob@example.com", "phone": "123-456-7890" },
      { "id": 3, "name": "Charlie", "role": "user", "active": true }
    ]
  },
  products: {
    label: 'Products',
    data: [
      { "id": 101, "product": "Laptop", "price": 999, "stock": 50, "tags": ["electronics", "computers"] },
      { "id": 102, "product": "Mouse", "price": 25, "stock": 200 },
      { "id": 103, "product": "Keyboard", "price": 45, "details": { "layout": "US", "mechanical": true } }
    ]
  }
};

const JSONTableViewer = () => {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);

  const handleClear = () => {
    setInput('');
    setParsedData(null);
    setError(null);
    setColumns([]);
  };

  const loadExample = (e) => {
    const key = e.target.value;
    if (EXAMPLES[key]) {
      const data = EXAMPLES[key].data;
      setInput(JSON.stringify(data, null, 2));
      // Auto parse for convenience
      parseAndSetData(data);
    }
  };

  const parseAndSetData = (data) => {
    if (!Array.isArray(data)) {
      setError('JSON must be an array of objects to view as a table.');
      setParsedData(null);
      setColumns([]);
      return;
    }
    
    // Extract all unique keys
    const allKeys = new Set();
    data.forEach(item => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach(k => allKeys.add(k));
      }
    });
    
    setParsedData(data);
    setColumns(Array.from(allKeys));
    setError(null);
  };

  const handleParse = () => {
    if (!input.trim()) {
      setParsedData(null);
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      parseAndSetData(parsed);
    } catch (err) {
      setError(err.message);
      setParsedData(null);
    }
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const downloadCSV = () => {
    if (!parsedData || !columns.length) return;

    const headers = columns.join(',');
    const rows = parsedData.map(row => {
      return columns.map(col => {
        let val = row[col];
        if (val === null || val === undefined) val = '';
        else if (typeof val === 'object') val = JSON.stringify(val);
        else val = String(val);
        
        // Escape quotes and wrap in quotes if contains comma, quote or newline
        if (val.includes('"') || val.includes(',') || val.includes('\n')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container">
      <h2>JSON Table Viewer</h2>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <select onChange={loadExample} style={{ padding: '5px' }}>
            <option value="">Select an example...</option>
            {Object.keys(EXAMPLES).map(key => (
              <option key={key} value={key}>{EXAMPLES[key].label}</option>
            ))}
          </select>
        </div>
        <textarea
          style={{ width: '100%', minHeight: '150px', fontFamily: 'monospace', padding: '10px' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste JSON array here..."
        />
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={handleParse}
            style={{ padding: '8px 16px', cursor: 'pointer', marginRight: '10px' }}
          >
            Parse JSON
          </button>
          <button 
            onClick={handleClear}
            style={{ padding: '8px 16px', cursor: 'pointer', marginRight: '10px' }}
          >
            Clear
          </button>
          {parsedData && (
            <button 
              onClick={downloadCSV}
              style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Download CSV
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {parsedData && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'sans-serif', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                {columns.map(col => (
                  <th key={col} style={{ padding: '10px', border: '1px solid #ddd' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedData.map((row, rowIndex) => (
                <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  {columns.map(col => (
                    <td key={`${rowIndex}-${col}`} style={{ padding: '8px', border: '1px solid #ddd' }}>
                      {formatValue(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JSONTableViewer;
