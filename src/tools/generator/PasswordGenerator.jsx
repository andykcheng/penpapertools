import React, { useState } from 'react';

export const metadata = {
  id: 'password-generator',
  name: 'Password Generator',
  description: 'Generate secure passwords and estimate cracking time',
  category: 'generator'
};

const AMBIGUOUS = 'Il1O0';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>/?|~';

const speeds = [
  { label: '1k guesses/sec (slow online)', value: 1e3 },
  { label: '1M guesses/sec (desktop GPU)', value: 1e6 },
  { label: '1G guesses/sec (cluster)', value: 1e9 },
  { label: '1T guesses/sec (massive botnet/specialized)', value: 1e12 },
];

const formatBig = (seconds) => {
  if (!isFinite(seconds) || seconds > 1e50) return 'centuries (very large)';
  const units = [
    { u: 'year', s: 60 * 60 * 24 * 365 },
    { u: 'day', s: 60 * 60 * 24 },
    { u: 'hour', s: 60 * 60 },
    { u: 'minute', s: 60 },
    { u: 'second', s: 1 },
  ];
  for (const unit of units) {
    if (seconds >= unit.s) {
      const v = seconds / unit.s;
      return `${Number(v.toFixed(v >= 10 ? 0 : 2))} ${unit.u}${v >= 2 ? 's' : ''}`;
    }
  }
  return `${Number(seconds.toFixed(2))} seconds`;
};

const classifyEntropy = (bits) => {
  if (bits < 28) return 'Very weak';
  if (bits < 36) return 'Weak';
  if (bits < 60) return 'Moderate';
  if (bits < 128) return 'Strong';
  return 'Very strong';
};

const secureRandomIndex = (n) => {
  // Returns a secure random integer in [0, n)
  const range = n;
  if (range <= 0) return 0;
  const max = Math.floor(0xFFFFFFFF / range) * range;
  const arr = new Uint32Array(1);
  while (true) {
    window.crypto.getRandomValues(arr);
    const val = arr[0];
    if (val < max) return val % range;
  }
};

const generateOne = (length, pool) => {
  const out = [];
  const poolLen = pool.length;
  for (let i = 0; i < length; i++) {
    const idx = secureRandomIndex(poolLen);
    out.push(pool[idx]);
  }
  return out.join('');
};

const estimate = (length, poolSize) => {
  if (poolSize <= 1 || length <= 0) return { bits: 0, times: [] };
  const bits = length * Math.log2(poolSize);
  // average guesses = 2^(bits-1)
  const log10Guesses = (bits - 1) * Math.LOG10E * Math.LN2; // (bits-1)*log10(2)
  const times = speeds.map(s => {
    // log10(seconds) = log10(guesses) - log10(speed)
    const log10sec = log10Guesses - Math.log10(s.value);
    const seconds = Math.pow(10, log10sec);
    return { label: s.label, seconds, pretty: formatBig(seconds) };
  });
  return { bits, times };
};

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeDigits, setIncludeDigits] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [quantity, setQuantity] = useState(10);
  const [passwords, setPasswords] = useState([]);
  const [error, setError] = useState(null);

  const buildPool = () => {
    let pool = '';
    if (includeUpper) pool += UPPER;
    if (includeLower) pool += LOWER;
    if (includeDigits) pool += DIGITS;
    if (includeSymbols) pool += SYMBOLS;
    if (excludeAmbiguous) pool = pool.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
    return pool;
  };

  const handleGenerate = () => {
    setError(null);
    const pool = buildPool();
    if (!pool || pool.length === 0) {
      setError('Character pool is empty. Enable at least one character type.');
      setPasswords([]);
      return;
    }
    if (length <= 0) {
      setError('Length must be > 0');
      setPasswords([]);
      return;
    }
    const list = [];
    for (let i = 0; i < Math.max(1, quantity); i++) {
      list.push(generateOne(length, pool));
    }
    setPasswords(list);
  };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
  };

  const handleCopyAll = async () => {
    if (passwords.length) await navigator.clipboard.writeText(passwords.join('\n'));
  };

  const handleDownload = () => {
    if (!passwords.length) return;
    const blob = new Blob([passwords.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passwords_${length}x${passwords.length}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pool = buildPool();
  const { bits, times } = estimate(length, pool.length || 1);

  return (
    <div className="tool-container">
      <h2>Password Generator</h2>

      <div style={{ marginBottom: 20, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 260, flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Length</label>
          <input type="number" min="1" value={length} onChange={e => setLength(Math.max(1, parseInt(e.target.value || 0)))} style={{ width: '100%', padding: 8, marginBottom: 10 }} />

          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <label><input type="checkbox" checked={includeUpper} onChange={e => setIncludeUpper(e.target.checked)} /> Uppercase</label>
            <label><input type="checkbox" checked={includeLower} onChange={e => setIncludeLower(e.target.checked)} /> Lowercase</label>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <label><input type="checkbox" checked={includeDigits} onChange={e => setIncludeDigits(e.target.checked)} /> Digits</label>
            <label><input type="checkbox" checked={includeSymbols} onChange={e => setIncludeSymbols(e.target.checked)} /> Symbols</label>
          </div>

          <label style={{ display: 'block', marginBottom: 10 }}>
            <input type="checkbox" checked={excludeAmbiguous} onChange={e => setExcludeAmbiguous(e.target.checked)} /> Exclude ambiguous chars (Il1O0)
          </label>

          <label style={{ display: 'block', marginBottom: 6 }}>Quantity</label>
          <input type="number" min="1" max="1000" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value || 1)))} style={{ width: '100%', padding: 8, marginBottom: 10 }} />

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleGenerate} style={{ padding: '8px 12px' }}>Generate</button>
            <button onClick={handleCopyAll} style={{ padding: '8px 12px' }} disabled={!passwords.length}>Copy All</button>
            <button onClick={handleDownload} style={{ padding: '8px 12px' }} disabled={!passwords.length}>Download</button>
          </div>

          {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        </div>

        <div style={{ minWidth: 320, flex: 2 }}>
          <div style={{ marginBottom: 10 }}>
            <strong>Character pool:</strong> {pool.length} characters
          </div>

          <div style={{ marginBottom: 10 }}>
            <strong>Entropy:</strong> {Number(bits.toFixed(2))} bits — <em>{classifyEntropy(bits)}</em>
          </div>

          <div style={{ marginBottom: 10 }}>
            <strong>Estimated crack times (average):</strong>
            <div style={{ border: '1px solid #eee', borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
              {times.map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <div style={{ color: '#555' }}>{t.label}</div>
                  <div style={{ fontFamily: 'monospace' }}>{t.pretty}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {passwords.length > 0 ? (
              <div style={{ border: '1px solid #eee', borderRadius: 4, padding: 8 }}>
                {passwords.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', borderBottom: i < passwords.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <div style={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}>{p}</div>
                    <button onClick={() => handleCopy(p)} style={{ padding: '4px 8px' }}>Copy</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#666' }}>No passwords generated yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;
