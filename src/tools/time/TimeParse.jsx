import React, { useState, useEffect } from 'react';
import moment from 'moment';

export const metadata = {
  id: 'time-parser',
  name: 'Time Parser',
  description: 'Parse date strings and timestamps into various formats',
  category: 'time'
};

const TimeParse = () => {
  const [input, setInput] = useState(new Date().toISOString());
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleParse(input);
  }, []);

  const handleParse = (val) => {
    if (!val || !val.trim()) {
      setParsed(null);
      setError(null);
      return;
    }

    let m;
    const trimmed = val.trim();

    // Check if input is a numeric timestamp
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      // Guess seconds vs milliseconds based on length (10 digits = seconds, 13 digits = ms)
      if (trimmed.length <= 10) {
        m = moment.unix(num);
      } else {
        m = moment(num);
      }
    } else {
      m = moment(trimmed);
    }

    if (!m.isValid()) {
      setError('Invalid Date Format');
      setParsed(null);
    } else {
      setError(null);
      setParsed(m);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    handleParse(val);
  };

  const formats = parsed ? [
    { label: 'ISO 8601 (UTC)', value: parsed.toISOString() },
    { label: 'Local Time', value: parsed.format('YYYY-MM-DD HH:mm:ss') },
    { label: 'Unix Timestamp (seconds)', value: parsed.unix() },
    { label: 'Unix Timestamp (ms)', value: parsed.valueOf() },
    { label: 'Relative Time', value: parsed.fromNow() },
    { label: 'RFC 2822', value: parsed.toString() },
    { label: 'YYYY/MM/DD', value: parsed.format('YYYY/MM/DD') },
    { label: 'MM/DD/YYYY', value: parsed.format('MM/DD/YYYY') },
    { label: 'DD/MM/YYYY', value: parsed.format('DD/MM/YYYY') },
    { label: 'Date Only', value: parsed.format('YYYY-MM-DD') },
    { label: 'Time Only', value: parsed.format('HH:mm:ss') },
    { label: 'Day of Week', value: parsed.format('dddd') },
    { label: 'Week of Year', value: parsed.week() },
    { label: 'Day of Year', value: parsed.dayOfYear() },
    { label: 'Quarter', value: `Q${parsed.quarter()}` },
  ] : [];

  return (
    <div className="tool-container">
      <h2>Time Parser</h2>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Date/Time String or Timestamp:</label>
        <input
          type="text"
          style={{ width: '100%', padding: '8px', fontSize: '16px', fontFamily: 'monospace' }}
          value={input}
          onChange={handleChange}
          placeholder="e.g., 2023-01-01, now, 1672531200"
        />
        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
          Supports ISO 8601, Unix timestamps (seconds/ms), and natural language.
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {parsed && (
        <div style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
          {formats.map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              padding: '10px 15px', 
              backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#fff',
              borderBottom: index < formats.length - 1 ? '1px solid #eee' : 'none',
              alignItems: 'center'
            }}>
              <span style={{ width: '200px', fontWeight: 'bold', color: '#555', flexShrink: 0 }}>{item.label}</span>
              <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeParse;
