import React, { useState } from 'react';

export const metadata = {
  id: 'jwt-generator',
  name: 'JWT Generator',
  description: 'Generate JWT tokens',
  category: 'tokens'
};

const JWTGenerator = () => {
  const [header, setHeader] = useState(JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2));
  const [payload, setPayload] = useState(JSON.stringify({ sub: "1234567890", name: "John Doe", iat: 1516239022 }, null, 2));
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const base64UrlEncode = (str) => {
    // Encode to UTF-8 bytes, then to binary string, then btoa to handle Unicode correctly
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const generateToken = async () => {
    setError('');
    setToken('');

    try {
      // Validate JSON
      let headerObj, payloadObj;
      try {
        headerObj = JSON.parse(header);
      } catch (e) {
        throw new Error('Invalid Header JSON');
      }
      try {
        payloadObj = JSON.parse(payload);
      } catch (e) {
        throw new Error('Invalid Payload JSON');
      }

      const alg = headerObj.alg;
      if (!['HS256', 'HS512'].includes(alg)) {
        throw new Error('Only HS256 and HS512 algorithms are supported in this generator.');
      }

      const encodedHeader = base64UrlEncode(JSON.stringify(headerObj));
      const encodedPayload = base64UrlEncode(JSON.stringify(payloadObj));
      
      const dataToSign = `${encodedHeader}.${encodedPayload}`;
      
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const data = encoder.encode(dataToSign);
      
      const hashName = alg === 'HS512' ? 'SHA-512' : 'SHA-256';

      const key = await window.crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: hashName }, false, ['sign']
      );
      
      const signature = await window.crypto.subtle.sign('HMAC', key, data);
      const signatureArray = Array.from(new Uint8Array(signature));
      const base64Signature = btoa(String.fromCharCode.apply(null, signatureArray))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      setToken(`${dataToSign}.${base64Signature}`);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="tool-container">
      <h2>JWT Generator</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Header (JSON):</label>
          <textarea
            style={{ width: '100%', minHeight: '150px', padding: '10px', fontFamily: 'monospace' }}
            value={header}
            onChange={(e) => setHeader(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Payload (JSON):</label>
          <textarea
            style={{ width: '100%', minHeight: '150px', padding: '10px', fontFamily: 'monospace' }}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Secret Key:</label>
        <input
          type="text"
          style={{ width: '100%', padding: '8px' }}
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Enter secret key"
        />
      </div>

      <button 
        onClick={generateToken}
        style={{ padding: '8px 16px', cursor: 'pointer', marginBottom: '20px' }}
      >
        Generate JWT
      </button>

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {token && (
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Generated Token:</label>
          <textarea
            readOnly
            style={{ width: '100%', minHeight: '100px', padding: '10px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', wordBreak: 'break-all' }}
            value={token}
          />
        </div>
      )}
    </div>
  );
};

export default JWTGenerator;
