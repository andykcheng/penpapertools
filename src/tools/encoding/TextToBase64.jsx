import React, { useState } from 'react';

export const metadata = {
  id: 'text-to-base64',
  name: 'Text to Base64',
  description: 'Convert text to Base64 string',
  category: 'encoding'
};

const EXAMPLES = {
  simple: {
    label: 'Simple Text',
    value: 'Hello World'
  },
  special: {
    label: 'Special Characters',
    value: 'Hello World! @#$%'
  },
  multiline: {
    label: 'Multiline Text',
    value: 'Line 1\nLine 2\nLine 3'
  },
  json: {
    label: 'JSON String',
    value: '{"id": 1, "name": "Test"}'
  }
};

const Utf8ToBase64 = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);

  const loadExample = (e) => {
    const key = e.target.value;
    if (EXAMPLES[key]) {
      setInput(EXAMPLES[key].value);
      setOutput('');
      setError(null);
    }
  };

  const handleConvert = () => {
    try {
      // Handle UTF-8 strings correctly
      const encoded = btoa(
        encodeURIComponent(input).replace(/%([0-9A-F]{2})/g,
          function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
          })
      );
      setOutput(encoded);
      setError(null);
    } catch (err) {
      setError('Failed to encode text. ' + err.message);
      setOutput('');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="tool-container">
      <h2>Text to Base64</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <select onChange={loadExample} style={{ padding: '5px' }}>
            <option value="">Select an example...</option>
            {Object.keys(EXAMPLES).map(key => (
              <option key={key} value={key}>{EXAMPLES[key].label}</option>
            ))}
          </select>
        </div>
        <label style={{ display: 'block', marginBottom: '5px' }}>Input Text:</label>
        <textarea
          style={{ width: '100%', minHeight: '100px', padding: '10px', fontFamily: 'monospace' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to encode..."
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleConvert}
          style={{ padding: '8px 16px', cursor: 'pointer', marginRight: '10px' }}
        >
          Encode to Base64
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
          <label style={{ display: 'block', marginBottom: '5px' }}>Base64 Output:</label>
          <textarea
            readOnly
            style={{ width: '100%', minHeight: '100px', padding: '10px', fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}
            value={output}
          />
        </div>
      )}
    </div>
  );
};

export default Utf8ToBase64;
