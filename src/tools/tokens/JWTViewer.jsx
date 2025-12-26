import React, { useState, useEffect } from 'react';

export const metadata = {
  id: 'jwt-viewer',
  name: 'JWT Viewer',
  description: 'Decode and verify JSON Web Tokens',
  category: 'tokens'
};

const JWTViewer = () => {
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const decodeBase64Url = (str) => {
    try {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const verifySignature = async (headerB64, payloadB64, signatureB64, secretKey, alg) => {
    if (!['HS256', 'HS512'].includes(alg)) {
      return { valid: false, message: 'Only HS256 and HS512 supported for client-side verification' };
    }
    
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secretKey);
      const data = encoder.encode(`${headerB64}.${payloadB64}`);
      
      const hashName = alg === 'HS512' ? 'SHA-512' : 'SHA-256';

      const key = await window.crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: hashName }, false, ['sign']
      );
      
      const signature = await window.crypto.subtle.sign('HMAC', key, data);
      const signatureArray = Array.from(new Uint8Array(signature));
      const calculatedSig = btoa(String.fromCharCode.apply(null, signatureArray))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        
      return calculatedSig === signatureB64 
        ? { valid: true, message: 'Signature Verified' }
        : { valid: false, message: 'Invalid Signature' };
    } catch (e) {
      return { valid: false, message: 'Verification Error: ' + e.message };
    }
  };

  useEffect(() => {
    if (!token) {
      setDecoded(null);
      setVerificationStatus(null);
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      setDecoded({ error: 'Invalid JWT format' });
      return;
    }

    const header = decodeBase64Url(parts[0]);
    const payload = decodeBase64Url(parts[1]);

    if (!header || !payload) {
      setDecoded({ error: 'Failed to decode Base64Url' });
      return;
    }

    setDecoded({ header, payload, parts });

    if (secret && header.alg) {
      verifySignature(parts[0], parts[1], parts[2], secret, header.alg)
        .then(setVerificationStatus);
    } else {
      setVerificationStatus(null);
    }
  }, [token, secret]);

  return (
    <div className="tool-container">
      <h2>JWT Viewer</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>JWT Token:</label>
        <textarea
          style={{ width: '100%', minHeight: '100px', padding: '10px', fontFamily: 'monospace' }}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste JWT here..."
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Secret Key (for verification):</label>
        <input
          type="text"
          style={{ width: '100%', padding: '8px' }}
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Enter secret to verify signature (HS256 / HS512)"
        />
      </div>

      {decoded?.error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>{decoded.error}</div>
      )}

      {decoded && !decoded.error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Status Bar */}
          <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div><strong>Type:</strong> {decoded.header.typ || 'JWT'}</div>
            <div><strong>Algorithm:</strong> {decoded.header.alg}</div>
            {verificationStatus && (
              <div style={{ 
                color: verificationStatus.valid ? 'green' : 'red', 
                fontWeight: 'bold',
                marginLeft: 'auto' 
              }}>
                {verificationStatus.message}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <h3>Header</h3>
              <pre style={{ backgroundColor: '#282c34', color: '#abb2bf', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>
            <div style={{ flex: 1 }}>
              <h3>Payload</h3>
              <pre style={{ backgroundColor: '#282c34', color: '#abb2bf', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JWTViewer;
