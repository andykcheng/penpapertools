import React, { useState } from 'react';

export const metadata = {
  id: 'file-to-base64',
  name: 'File to Base64',
  description: 'Convert a file to Base64 string',
  category: 'encoding'
};

const FileToBase64 = () => {
  const [output, setOutput] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setOutput(event.target.result);
    };
    reader.onerror = (err) => {
      setError('Failed to read file');
      console.error(err);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setOutput('');
    setFileName('');
    setError(null);
    // Reset file input if needed, though React state doesn't control uncontrolled inputs easily without a ref
    document.getElementById('file-input').value = '';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="tool-container">
      <h2>File to Base64</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Select File:</label>
        <input 
          id="file-input"
          type="file" 
          onChange={handleFileChange}
          style={{ marginBottom: '10px' }}
        />
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {output && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <label>Base64 Output ({fileName}):</label>
            <div>
              <button 
                onClick={handleCopy}
                style={{ padding: '4px 8px', cursor: 'pointer', marginRight: '10px' }}
              >
                Copy
              </button>
              <button 
                onClick={handleClear}
                style={{ padding: '4px 8px', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            readOnly
            style={{ width: '100%', minHeight: '200px', padding: '10px', fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}
            value={output}
          />
        </div>
      )}
    </div>
  );
};

export default FileToBase64;
