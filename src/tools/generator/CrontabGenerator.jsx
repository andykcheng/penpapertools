import React, { useState, useEffect } from 'react';

export const metadata = {
  id: 'crontab-generator',
  name: 'Crontab Generator',
  description: 'Generate and explain cron schedule expressions',
  category: 'generator'
};

const PRESETS = [
  { label: 'Every Minute', value: '* * * * *' },
  { label: 'Every 5 Minutes', value: '*/5 * * * *' },
  { label: 'Every 15 Minutes', value: '*/15 * * * *' },
  { label: 'Every Hour', value: '0 * * * *' },
  { label: 'Every 4 Hours', value: '0 */4 * * *' },
  { label: 'Every Day at Midnight', value: '0 0 * * *' },
  { label: 'Every Weekday (Mon-Fri)', value: '0 0 * * 1-5' },
  { label: 'Every Weekend (Sat-Sun)', value: '0 0 * * 6,0' },
  { label: 'Every Wednesday', value: '0 0 * * 3' },
  { label: 'First of Every Month', value: '0 0 1 * *' },
  { label: 'Yearly (Jan 1st)', value: '0 0 1 1 *' }
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const explainCron = (expression) => {
  if (!expression) return '';
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid format. Require 5 fields: min hour day month weekday";
  
  const [min, hour, dom, mon, dow] = parts;
  
  let timeDesc = '';
  if (min === '*' && hour === '*') timeDesc = "Every minute";
  else if (min.includes('/') && hour === '*') timeDesc = `Every ${min.split('/')[1]} minutes`;
  else if (min === '0' && hour === '*') timeDesc = "At the start of every hour";
  else if (min === '0' && hour === '0') timeDesc = "At midnight";
  else if (hour.includes('/')) {
      const step = hour.split('/')[1];
      timeDesc = `At minute ${min}, every ${step} hours`;
  } else {
      const h = hour === '*' ? 'every hour' : hour;
      const m = min === '*' ? 'every minute' : min;
      timeDesc = `At ${h}:${m.length === 1 ? '0'+m : m}`;
  }

  let dateDesc = [];
  if (dom !== '*' && dom !== '?') dateDesc.push(`on day ${dom} of the month`);
  
  if (mon !== '*') {
      const mName = isNaN(mon) ? mon : (MONTHS[parseInt(mon)-1] || mon);
      dateDesc.push(`in ${mName}`);
  }
  
  if (dow !== '*' && dow !== '?') {
      let dName = dow;
      if (dow === '1-5') dName = 'Mon-Fri';
      else if (dow === '0,6' || dow === '6,0') dName = 'Sat-Sun';
      else if (!isNaN(dow)) dName = DAYS[parseInt(dow)] || dow;
      dateDesc.push(`on ${dName}`);
  }

  return `${timeDesc}${dateDesc.length > 0 ? ', ' + dateDesc.join(', ') : ''}.`;
};

const CrontabGenerator = () => {
  const [expression, setExpression] = useState('* * * * *');
  const [desc, setDesc] = useState('');

  // Builder State
  const [bMin, setBMin] = useState('*');
  const [bHour, setBHour] = useState('*');
  const [bDom, setBDom] = useState('*');
  const [bMon, setBMon] = useState('*');
  const [bDow, setBDow] = useState('*');

  useEffect(() => {
    setDesc(explainCron(expression));
  }, [expression]);

  const updateExpression = (min, hour, dom, mon, dow) => {
    setExpression(`${min} ${hour} ${dom} ${mon} ${dow}`);
  };

  const handleBuilderChange = (field, value) => {
    let newMin = bMin, newHour = bHour, newDom = bDom, newMon = bMon, newDow = bDow;
    
    if (field === 'min') { setBMin(value); newMin = value; }
    if (field === 'hour') { setBHour(value); newHour = value; }
    if (field === 'dom') { setBDom(value); newDom = value; }
    if (field === 'mon') { setBMon(value); newMon = value; }
    if (field === 'dow') { setBDow(value); newDow = value; }
    
    updateExpression(newMin, newHour, newDom, newMon, newDow);
  };

  const loadPreset = (val) => {
    setExpression(val);
    const parts = val.split(' ');
    if (parts.length === 5) {
      setBMin(parts[0]);
      setBHour(parts[1]);
      setBDom(parts[2]);
      setBMon(parts[3]);
      setBDow(parts[4]);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(expression);
  };

  return (
    <div className="tool-container">
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <div style={{ fontSize: '1.2em', marginBottom: '10px', fontFamily: 'monospace', fontWeight: 'bold', display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={expression} 
            onChange={(e) => setExpression(e.target.value)}
            style={{ flex: 1, padding: '10px', fontSize: '1.1em', fontFamily: 'monospace' }}
          />
          <button onClick={copyToClipboard} style={{ padding: '0 20px', cursor: 'pointer' }}>Copy</button>
        </div>
        <div style={{ color: '#28a745', fontWeight: '500', minHeight: '24px' }}>
          {desc}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '300px' }}>
          <h3>Builder</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Minute</label>
              <select value={bMin} onChange={(e) => handleBuilderChange('min', e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="*">Every Minute (*)</option>
                <option value="*/2">Every 2 Minutes (*/2)</option>
                <option value="*/5">Every 5 Minutes (*/5)</option>
                <option value="*/15">Every 15 Minutes (*/15)</option>
                <option value="*/30">Every 30 Minutes (*/30)</option>
                <option value="0">At 0 (0)</option>
                <option value="30">At 30 (30)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hour</label>
              <select value={bHour} onChange={(e) => handleBuilderChange('hour', e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="*">Every Hour (*)</option>
                <option value="*/2">Every 2 Hours (*/2)</option>
                <option value="*/4">Every 4 Hours (*/4)</option>
                <option value="*/6">Every 6 Hours (*/6)</option>
                <option value="0">At Midnight (0)</option>
                <option value="9-17">Work Hours (9-17)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Day of Month</label>
              <select value={bDom} onChange={(e) => handleBuilderChange('dom', e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="*">Every Day (*)</option>
                <option value="1">1st of Month</option>
                <option value="15">15th of Month</option>
                <option value="1,15">1st and 15th</option>
                <option value="L">Last Day of Month (L)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Month</label>
              <select value={bMon} onChange={(e) => handleBuilderChange('mon', e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="*">Every Month (*)</option>
                {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                <option value="*/3">Every 3 Months (Quarterly)</option>
                <option value="11">November Only</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Day of Week</label>
              <select value={bDow} onChange={(e) => handleBuilderChange('dow', e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="*">Every Day (*)</option>
                <option value="1-5">Weekdays (Mon-Fri)</option>
                <option value="0,6">Weekend (Sat-Sun)</option>
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '200px', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
          <h3>Quick Presets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PRESETS.map(p => (
              <button 
                key={p.label} 
                onClick={() => loadPreset(p.value)}
                style={{ padding: '8px', textAlign: 'left', cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3>Crontab Cheatsheet</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f1f1', textAlign: 'left' }}>
              <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Field</th>
              <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Allowed Values</th>
              <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Special Characters</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Minute</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>0-59</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>* , - /</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Hour</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>0-23</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>* , - /</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Day of Month</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>1-31</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>* , - / ? L W</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Month</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>1-12 or JAN-DEC</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>* , - /</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Day of Week</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>0-6 (Sun-Sat) or SUN-SAT</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>* , - / ? L #</td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: '10px', fontSize: '0.85em', color: '#666' }}>
          <strong>Special Characters:</strong><br/>
          <code>*</code> : Any value<br/>
          <code>,</code> : Value list separator (e.g., 1,3,5)<br/>
          <code>-</code> : Range of values (e.g., 1-5)<br/>
          <code>/</code> : Step values (e.g., */5)<br/>
        </div>
      </div>
    </div>
  );
};

export default CrontabGenerator;
