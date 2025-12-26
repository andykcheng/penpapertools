import React, { useState, useEffect } from 'react';

export const metadata = {
  id: 'base64-to-file',
  name: 'Base64 to File',
  description: 'Convert Base64 string to file download',
  category: 'encoding'
};

const Base64ToFile = () => {
  const [input, setInput] = useState('');
  const [fileName, setFileName] = useState('download');
  const [mimeType, setMimeType] = useState('application/octet-stream');
  const [error, setError] = useState(null);

  // Auto-detect mime type if data URL is pasted
  useEffect(() => {
    if (input.startsWith('data:')) {
      const matches = input.match(/^data:([^;]+);base64,/);
      if (matches && matches[1]) {
        setMimeType(matches[1]);
      }
    }
  }, [input]);

  const handleDownload = () => {
    setError(null);
    if (!input.trim()) {
      setError('Please enter a Base64 string.');
      return;
    }

    try {
      let base64Data = input.trim();
      let finalMimeType = mimeType;

      // Check for Data URL scheme
      if (base64Data.startsWith('data:')) {
        const parts = base64Data.split(',');
        if (parts.length < 2) {
            throw new Error('Invalid Data URL format');
        }
        const meta = parts[0];
        base64Data = parts.slice(1).join(','); 
        
        const mimeMatch = meta.match(/^data:([^;]+);/);
        if (mimeMatch) {
            finalMimeType = mimeMatch[1];
        }
      }

      // Decode Base64
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      const blob = new Blob([byteArray], { type: finalMimeType });
      
      // Trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (err) {
      setError('Failed to convert: ' + err.message);
    }
  };

  const handleClear = () => {
    setInput('');
    setFileName('download');
    setMimeType('application/octet-stream');
    setError(null);
  };

  return (
    <div className="tool-container">
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Base64 String:</label>
        <textarea
          style={{ width: '100%', minHeight: '150px', padding: '10px', fontFamily: 'monospace' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste Base64 string here (with or without data: prefix)..."
        />
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Filename:</label>
          <input
            type="text"
            style={{ width: '100%', padding: '8px' }}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="example.png"
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>MIME Type:</label>
          <input
            type="text"
            style={{ width: '100%', padding: '8px' }}
            value={mimeType}
            onChange={(e) => setMimeType(e.target.value)}
            placeholder="application/octet-stream"
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleDownload}
          style={{ padding: '8px 16px', cursor: 'pointer', marginRight: '10px' }}
        >
          Download File
        </button>
        <button 
          onClick={handleClear}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Clear
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Base64ToFile;
