import React, { useState } from 'react';

export const metadata = {
  id: 'aes-encryption',
  name: 'AES Encryption',
  description: 'Encrypt and decrypt text using AES-GCM',
  category: 'encryption'
};

const AESEncryption = () => {
  const [key, setKey] = useState(null);
  const [keyHex, setKeyHex] = useState('');
  const [plainText, setPlainText] = useState('');
  const [ivHex, setIvHex] = useState('');
  const [cipherTextHex, setCipherTextHex] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [error, setError] = useState(null);

  // Utility functions for Hex conversion
  const buf2hex = (buffer) => {
    return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  };

  const hex2buf = (hexString) => {
    if (!hexString) return new Uint8Array(0);
    const matches = hexString.match(/.{1,2}/g);
    if (!matches) return new Uint8Array(0);
    return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
  };

  const generateKey = async () => {
    try {
      const k = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      setKey(k);
      const exported = await window.crypto.subtle.exportKey("raw", k);
      setKeyHex(buf2hex(exported));
      setError(null);
      // Clear previous outputs when key changes
      setIvHex('');
      setCipherTextHex('');
      setDecryptedText('');
    } catch (e) {
      setError("Key generation failed: " + e.message);
    }
  };

  const handleEncrypt = async () => {
    if (!key) {
      setError("Please generate a key first.");
      return;
    }
    try {
      // Generate a random 96-bit IV (12 bytes) standard for GCM
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encodedText = new TextEncoder().encode(plainText);
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encodedText
      );

      setIvHex(buf2hex(iv));
      setCipherTextHex(buf2hex(encrypted));
      setDecryptedText(''); // Clear previous decryption result
      setError(null);
    } catch (e) {
      setError("Encryption failed: " + e.message);
    }
  };

  const handleDecrypt = async () => {
    if (!key) {
      setError("Please generate a key first.");
      return;
    }
    if (!ivHex || !cipherTextHex) {
      setError("IV and Ciphertext are required for decryption.");
      return;
    }
    try {
      const iv = hex2buf(ivHex);
      const cipherText = hex2buf(cipherTextHex);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        cipherText
      );

      setDecryptedText(new TextDecoder().decode(decrypted));
      setError(null);
    } catch (e) {
      setError("Decryption failed. Check Key, IV, or Ciphertext.");
      setDecryptedText('');
    }
  };

  return (
    <div className="tool-container">
      <h2>AES Encryption (GCM Mode)</h2>
      
      {/* Key Section */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>1. Secret Key</h3>
          <button onClick={generateKey} style={{ padding: '6px 12px', cursor: 'pointer' }}>Generate New Key</button>
        </div>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Key (Hex - 256 bit):</label>
        <input 
          type="text" 
          readOnly 
          value={keyHex} 
          placeholder="Generate a key to start..."
          style={{ width: '100%', padding: '8px', fontFamily: 'monospace', backgroundColor: '#fff' }} 
        />
      </div>

      {/* Input Section */}
      <div style={{ marginBottom: '20px' }}>
        <h3>2. Plaintext</h3>
        <textarea
          style={{ width: '100%', minHeight: '80px', padding: '10px', fontFamily: 'monospace' }}
          value={plainText}
          onChange={(e) => setPlainText(e.target.value)}
          placeholder="Enter text to encrypt..."
        />
        <button 
          onClick={handleEncrypt}
          disabled={!key}
          style={{ marginTop: '10px', padding: '8px 16px', cursor: key ? 'pointer' : 'not-allowed', backgroundColor: key ? '#4CAF50' : '#ccc', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Encrypt
        </button>
      </div>

      {/* Output Section */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>3. Encrypted Output</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Initialization Vector (IV) - Hex:</label>
          <input 
            type="text" 
            value={ivHex} 
            onChange={(e) => setIvHex(e.target.value)}
            placeholder="IV will appear here..."
            style={{ width: '100%', padding: '8px', fontFamily: 'monospace' }} 
          />
          <small style={{ color: '#666' }}>Random 12 bytes generated for every encryption.</small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ciphertext - Hex:</label>
          <textarea
            value={cipherTextHex}
            onChange={(e) => setCipherTextHex(e.target.value)}
            placeholder="Encrypted text will appear here..."
            style={{ width: '100%', minHeight: '80px', padding: '10px', fontFamily: 'monospace' }}
          />
        </div>

        <button 
          onClick={handleDecrypt}
          disabled={!key || !cipherTextHex}
          style={{ padding: '8px 16px', cursor: (key && cipherTextHex) ? 'pointer' : 'not-allowed', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Decrypt (Verify)
        </button>
      </div>

      {/* Decryption Result */}
      {decryptedText && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #4CAF50', borderRadius: '4px', backgroundColor: '#e8f5e9' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2e7d32' }}>Decrypted Result:</label>
          <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{decryptedText}</div>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px', marginTop: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default AESEncryption;
