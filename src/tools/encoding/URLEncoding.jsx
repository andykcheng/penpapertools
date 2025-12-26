import React, { useState } from 'react';

export const metadata = {
  id: 'url-encoding',
  name: 'URL Encoder/Decoder',
  description: 'Encode or decode URL strings',
  category: 'encoding'
};

const URLEncoding = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);

  const handleEncode = () => {
    try {
      setOutput(encodeURIComponent(input));
      setError(null);
    } catch (err) {
      setError('Encoding failed: ' + err.message);
    }
  };

  const handleDecode = () => {
    try {
      setOutput(decodeURIComponent(input));
      setError(null);
    } catch (err) {
      setError('Decoding failed: ' + err.message);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="tool-container">
      <h2>URL Encoder/Decoder</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Input Text:</label>
        <textarea
          style={{ width: '100%', minHeight: '150px', padding: '10px', fontFamily: 'monospace' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to encode or decode..."
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleEncode}
          style={{ padding: '8px 16px', cursor: 'pointer', marginRight: '10px' }}
        >
          Encode
        </button>
        <button 
          onClick={handleDecode}
          style={{ padding: '8px 16px', cursor: 'pointer', marginRight: '10px' }}
        >
          Decode
        </button>
        <button 
          onClick={handleClear}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Clear
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {output && (
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Result:</label>
          <textarea
            readOnly
            style={{ width: '100%', minHeight: '150px', padding: '10px', fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}
            value={output}
          />
        </div>
      )}
    </div>
  );
};

export default URLEncoding;
