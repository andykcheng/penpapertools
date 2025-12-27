import React, { useState } from 'react';

export const metadata = {
  id: 'number-conversion',
  name: 'Number Conversion',
  description: 'Convert numbers to binary/hex/octal and view IEEE-754 bits',
  category: 'encoding'
};

const NumberConversion = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('int'); // 'int' or 'float'
  const [bits, setBits] = useState(32);
  const [signed, setSigned] = useState(true);
  const [endianness, setEndianness] = useState('big'); // for display only
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const parseIntInput = (str) => {
    // allow hex (0x...), binary (0b...), octal (0o...) or decimal
    try {
      if (/^0x/i.test(str)) return BigInt(str);
      if (/^0b/i.test(str)) return BigInt(str);
      if (/^0o/i.test(str)) return BigInt(str);
      // may be negative
      if (/^-?\d+$/.test(str.trim())) return BigInt(str);
      return null;
    } catch {
      return null;
    }
  };

  const toBinaryStringFromBigInt = (valueBig, width) => {
    const mask = (1n << BigInt(width)) - 1n;
    const unsigned = valueBig & mask;
    let s = unsigned.toString(2);
    if (s.length > width) s = s.slice(-width);
    return s.padStart(width, '0');
  };

  const intConversions = (raw) => {
    const valueBig = parseIntInput(raw);
    if (valueBig === null) throw new Error('Invalid integer input');
    if (![8,16,32,64].includes(bits)) throw new Error('Supported integer widths: 8,16,32,64');
    const width = bits;
    const binBE = toBinaryStringFromBigInt(valueBig, width);

    // build bytes (big-endian)
    const byteCount = Math.ceil(width / 8);
    const byteArrBE = [];
    for (let i = 0; i < byteCount; i++) {
      const start = i * 8;
      const end = start + 8;
      // slice from MSB side
      const slice = binBE.slice(start, end);
      byteArrBE.push(parseInt(slice, 2));
    }

    // little-endian bytes are reverse
    const byteArrLE = [...byteArrBE].reverse();

    const binLE = byteArrLE.map(b => b.toString(2).padStart(8, '0')).join('');
    const hexBE = BigInt('0b' + binBE).toString(16).padStart(Math.ceil(width/4), '0');
    const hexLE = byteArrLE.map(b => b.toString(16).padStart(2, '0')).join('');

    const oct = BigInt('0b' + binBE).toString(8);

    // decimal: for signed, interpret MSB as sign (based on big-endian bit order)
    let dec;
    if (signed) {
      const signBit = binBE[0];
      if (signBit === '0') dec = BigInt('0b' + binBE).toString(10);
      else {
        const unsigned = BigInt('0b' + binBE);
        const signedVal = unsigned - (1n << BigInt(width));
        dec = signedVal.toString(10);
      }
    } else {
      dec = BigInt('0b' + binBE).toString(10);
    }

    return {
      binaryBE: binBE,
      binaryLE: binLE,
      hexBE,
      hexLE,
      octal: oct,
      decimal: dec
    };
  };

  const floatConversions = (raw) => {
    const n = Number(raw);
    if (!isFinite(n)) throw new Error('Invalid float input');
    if (![32,64].includes(bits)) throw new Error('Supported float widths: 32 or 64');
    const width = bits;
    let buffer = new ArrayBuffer(width === 32 ? 4 : 8);
    let view = new DataView(buffer);
    // write in big-endian for canonical representation
    if (width === 32) view.setFloat32(0, n, false);
    else view.setFloat64(0, n, false);

    // read bytes big-endian order
    const bytesBE = [];
    for (let i = 0; i < buffer.byteLength; i++) {
      bytesBE.push(view.getUint8(i));
    }
    const bytesLE = [...bytesBE].reverse();

    const bitsBE = bytesBE.map(b => b.toString(2).padStart(8, '0')).join('');
    const bitsLE = bytesLE.map(b => b.toString(2).padStart(8, '0')).join('');

    let sign = bitsBE[0];
    let expBits = width === 32 ? 8 : 11;
    let mantBits = width === 32 ? 23 : 52;
    const exponent = bitsBE.slice(1, 1 + expBits);
    const mantissa = bitsBE.slice(1 + expBits);
    const expVal = parseInt(exponent, 2);

    const hexBE = bytesBE.map(b => b.toString(16).padStart(2, '0')).join('');
    const hexLE = bytesLE.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
      binaryBE: bitsBE,
      binaryLE: bitsLE,
      hexBE,
      hexLE,
      decimal: String(n),
      sign,
      exponent,
      exponentValue: expVal,
      mantissa
    };
  };

  const handleConvert = () => {
    setError(null);
    setResult(null);
    try {
      if (mode === 'int') {
        const res = intConversions(input.trim());
        setResult({ type: 'int', ...res });
      } else {
        const res = floatConversions(input.trim());
        setResult({ type: 'float', ...res });
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setError(null);
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <div className="tool-container">
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Mode</label>
        <select value={mode} onChange={e => setMode(e.target.value)} style={{ padding:8 }}>
          <option value="int">Integer</option>
          <option value="float">Float (IEEE-754)</option>
        </select>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:12 }}>
        <div>
          <label style={{ display:'block', fontWeight:'bold' }}>Bits</label>
          <select value={bits} onChange={e=>setBits(Number(e.target.value))} style={{ padding:8 }}>
            {mode==='int' ? [8,16,32,64].map(b=> <option key={b} value={b}>{b}</option>)
              : [32,64].map(b=> <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {mode==='int' && (
          <div>
            <label style={{ display:'block', fontWeight:'bold' }}>Signed</label>
            <select value={signed} onChange={e=>setSigned(e.target.value==='true')} style={{ padding:8 }}>
              <option value="true">Signed (two's complement)</option>
              <option value="false">Unsigned</option>
            </select>
          </div>
        )}

        <div>
          <label style={{ display:'block', fontWeight:'bold' }}>Endianness (display)</label>
          <select value={endianness} onChange={e=>setEndianness(e.target.value)} style={{ padding:8 }}>
            <option value="big">Big-endian</option>
            <option value="little">Little-endian</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom:12 }}>
        <label style={{ display:'block', fontWeight:'bold' }}>Input Number</label>
        <input
          type="text"
          value={input}
          onChange={e=>setInput(e.target.value)}
          placeholder={mode==='int' ? "e.g. 42 or -1 or 0xFF or 0b1010" : "e.g. 3.14"}
          style={{ width:'100%', padding:10, fontFamily:'monospace' }}
        />
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <button onClick={handleConvert} style={{ padding:'8px 12px', cursor:'pointer' }}>Convert</button>
        <button onClick={handleClear} style={{ padding:'8px 12px' }}>Clear</button>
      </div>

      {error && <div style={{ color:'red', marginBottom:12 }}>{error}</div>}

      {result && result.type === 'int' && (
        <div style={{ background:'#f7f7f7', padding:12, borderRadius:6 }}>
          <div style={{ marginBottom:8 }}>
            <strong>Binary:</strong>
            <code style={{ fontFamily:'monospace' }}>
              {endianness === 'big' ? result.binaryBE : result.binaryLE}
            </code>
            <button onClick={() => copy(endianness === 'big' ? result.binaryBE : result.binaryLE)}>Copy</button>
          </div>
          <div style={{ marginBottom:8 }}>
            <strong>Hex:</strong>
            <code style={{ fontFamily:'monospace' }}>{endianness === 'big' ? result.hexBE : result.hexLE}</code>
            <button onClick={() => copy(endianness === 'big' ? result.hexBE : result.hexLE)}>Copy</button>
          </div>
          <div style={{ marginBottom:8 }}>
            <strong>Octal:</strong>
            <code style={{ fontFamily:'monospace' }}>{result.octal}</code>
            <button onClick={()=>copy(result.octal)}>Copy</button>
          </div>
          <div style={{ marginBottom:8 }}>
            <strong>Decimal ({signed ? 'signed' : 'unsigned'}):</strong>
            <code style={{ fontFamily:'monospace' }}>{result.decimal}</code>
          </div>
        </div>
      )}

      {result && result.type === 'float' && (
        <div style={{ background:'#f7f7f7', padding:12, borderRadius:6 }}>
          <div style={{ marginBottom:8 }}>
            <strong>Binary (IEEE-{bits}):</strong>
            <code style={{ fontFamily:'monospace' }}>
              {endianness==='big' ? result.binaryBE : result.binaryLE}
            </code>
            <button onClick={()=>copy(endianness==='big' ? result.binaryBE : result.binaryLE)}>Copy</button>
          </div>
          <div style={{ marginBottom:8 }}>
            <strong>Hex:</strong>
            <code style={{ fontFamily:'monospace' }}>{endianness==='big' ? result.hexBE : result.hexLE}</code>
            <button onClick={()=>copy(endianness==='big' ? result.hexBE : result.hexLE)}>Copy</button>
          </div>
          <div style={{ marginBottom:8 }}>
            <strong>Decimal:</strong> <code style={{ fontFamily:'monospace' }}>{result.decimal}</code>
          </div>
          <div style={{ marginTop:8 }}>
            <strong>Fields</strong>
            <div>Sign: <code style={{ fontFamily:'monospace' }}>{result.sign}</code></div>
            <div>Exponent (bits): <code style={{ fontFamily:'monospace' }}>{result.exponent} (value: {result.exponentValue})</code></div>
            <div>Mantissa: <code style={{ fontFamily:'monospace' }}>{result.mantissa}</code></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberConversion;
