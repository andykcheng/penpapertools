import React, { useState, useEffect } from 'react';
import moment from 'moment';

export const metadata = {
  id: 'time-display',
  name: 'Current Time',
  description: 'Display current time in various formats',
  category: 'time'
};

const TimeDisplay = () => {
  const [now, setNow] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(moment());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formats = [
    { label: 'ISO 8601 (UTC)', value: now.toISOString() },
    { label: 'Local Time', value: now.format('YYYY-MM-DD HH:mm:ss') },
    { label: 'Unix Timestamp (seconds)', value: now.unix() },
    { label: 'Unix Timestamp (ms)', value: now.valueOf() },
    { label: 'RFC 2822', value: now.toString() },
    { label: 'Date Only', value: now.format('YYYY-MM-DD') },
    { label: 'Time Only', value: now.format('HH:mm:ss') },
    { label: 'Day of Week', value: now.format('dddd') },
    { label: 'Week of Year', value: now.week() },
    { label: 'Day of Year', value: now.dayOfYear() },
    { label: 'Quarter', value: `Q${now.quarter()}` },
  ];

  return (
    <div className="tool-container">
      <h2>Current Time</h2>
      <div style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden', marginTop: '20px' }}>
        {formats.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            padding: '10px 15px', 
            backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#fff',
            borderBottom: index < formats.length - 1 ? '1px solid #eee' : 'none',
            alignItems: 'center'
          }}>
            <span style={{ width: '200px', fontWeight: 'bold', color: '#555', flexShrink: 0 }}>{item.label}</span>
            <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', flexGrow: 1, marginRight: '10px' }}>{item.value}</span>
            <button 
              onClick={() => handleCopy(item.value)}
              style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '0.85em' }}
            >
              Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeDisplay;
