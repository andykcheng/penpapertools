import React, { useState, useMemo } from 'react';

export const metadata = {
  id: 'regex-visualizer',
  name: 'Regex Visualizer',
  description: 'Test and visualize Regular Expressions',
  category: 'misc'
};

const PRESETS = [
  { label: 'Email Address', value: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', example: 'test.user@example.com' },
  { label: 'US Phone Number', value: '(\\(\\d{3}\\)|\\d{3})[\\s.-]?\\d{3}[\\s.-]?\\d{4}', example: '(555) 123-4567' },
  { label: 'US Zip Code', value: '\\d{5}(-\\d{4})?', example: '90210-1234' },
  { label: 'UK Phone Number', value: '^(((\\+44\\s?\\d{4}|\\(?0\\d{4}\\)?)\\s?\\d{3}\\s?\\d{3})|((\\+44\\s?\\d{3}|\\(?0\\d{3}\\)?)\\s?\\d{3}\\s?\\d{4})|((\\+44\\s?\\d{2}|\\(?0\\d{2}\\)?)\\s?\\d{4}\\s?\\d{4}))(\\s?\\#(\\d{4}|\\d{3}))?$', example: '+44 7911 123456' },
  { label: 'UK Postcode', value: '([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\\s?[0-9][A-Za-z]{2})', example: 'SW1A 1AA' },
  { label: 'Date (YYYY-MM-DD)', value: '\\d{4}-\\d{2}-\\d{2}', example: '2023-12-31' },
  { label: 'Time (HH:MM 24h)', value: '([01]?[0-9]|2[0-3]):[0-5][0-9]', example: '14:30' },
  { label: 'IPv4 Address', value: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', example: '192.168.1.1' },
  { label: 'URL / Website', value: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', example: 'https://www.example.com/path?query=1' },
  { label: 'Hex Color', value: '#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})', example: '#ff5733' },
  { label: 'Slug', value: '^[a-z0-9]+(?:-[a-z0-9]+)*$', example: 'my-blog-post-title' },
  { label: 'Password (Strong)', value: '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}', example: 'P@ssw0rd123!' }
];

const FLAG_INFO = {
  g: { label: 'Global', desc: "Don't return after first match" },
  i: { label: 'Insensitive', desc: 'Case insensitive match' },
  m: { label: 'Multi line', desc: '^ and $ match start/end of line' },
  s: { label: 'Single line', desc: 'Dot matches newline' },
  u: { label: 'Unicode', desc: 'Enable Unicode support' },
  y: { label: 'Sticky', desc: 'Anchor to lastIndex of regex object' }
};

const RegexVisualizer = () => {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState({ g: true, i: true, m: false, s: false, u: false, y: false });
  const [testString, setTestString] = useState('Contact us at support@example.com or sales@example.co.uk for more info.');
  const [error, setError] = useState(null);

  const regex = useMemo(() => {
    try {
      const flagStr = Object.keys(flags).filter(k => flags[k]).join('');
      const r = new RegExp(pattern, flagStr);
      setError(null);
      return r;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [pattern, flags]);

  const handlePresetChange = (e) => {
    const idx = e.target.value;
    if (idx !== "") {
      const preset = PRESETS[idx];
      setPattern(preset.value);
      setTestString(preset.example);
    }
  };

  const toggleFlag = (flag) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  const renderHighlights = () => {
    if (!regex || !testString) return testString;

    const elements = [];
    let lastIndex = 0;
    let matches = [];

    try {
      // If global flag is set, we can use matchAll or exec loop
      if (regex.flags.includes('g')) {
        matches = [...testString.matchAll(regex)];
      } else {
        // Without global flag, only the first match is found
        const m = regex.exec(testString);
        if (m) matches = [m];
      }

      if (matches.length === 0) return testString;

      matches.forEach((m, i) => {
        // Text before match
        if (m.index > lastIndex) {
          elements.push(<span key={`text-${i}`}>{testString.substring(lastIndex, m.index)}</span>);
        }
        // The match itself
        elements.push(
          <mark key={`match-${i}`} style={{ backgroundColor: '#fff3cd', color: '#000', padding: '0 2px', borderRadius: '2px', borderBottom: '2px solid #ffc107' }}>
            {m[0]}
          </mark>
        );
        lastIndex = m.index + m[0].length;
      });

      // Remaining text
      if (lastIndex < testString.length) {
        elements.push(<span key="text-end">{testString.substring(lastIndex)}</span>);
      }

      return elements;
    } catch (e) {
      return testString;
    }
  };

  const matches = useMemo(() => {
    if (!regex || !testString) return [];
    try {
      if (regex.flags.includes('g')) {
        return [...testString.matchAll(regex)];
      } else {
        const m = regex.exec(testString);
        return m ? [m] : [];
      }
    } catch (e) {
      return [];
    }
  }, [regex, testString]);

  return (
    <div className="tool-container">
      <h2>Regex Visualizer</h2>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Common Patterns:</label>
          <select onChange={handlePresetChange} style={{ padding: '8px', width: '100%', maxWidth: '400px' }}>
            <option value="">Select a preset...</option>
            {PRESETS.map((p, i) => (
              <option key={i} value={i}>{p.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Regex Pattern:</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', padding: '5px', backgroundColor: '#fff' }}>
              <span style={{ color: '#888', paddingRight: '5px' }}>/</span>
              <input 
                type="text" 
                value={pattern} 
                onChange={(e) => setPattern(e.target.value)}
                style={{ border: 'none', outline: 'none', flex: 1, fontFamily: 'monospace', fontSize: '1.1em' }}
              />
              <span style={{ color: '#888', paddingLeft: '5px' }}>/</span>
            </div>
          </div>
          
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Flags:</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {Object.keys(flags).map(f => (
                <label 
                  key={f} 
                  style={{ cursor: 'pointer', userSelect: 'none', fontFamily: 'monospace', display: 'flex', alignItems: 'center' }}
                  title={`${FLAG_INFO[f].label}: ${FLAG_INFO[f].desc}`}
                >
                  <input 
                    type="checkbox" 
                    checked={flags[f]} 
                    onChange={() => toggleFlag(f)}
                    style={{ marginRight: '4px' }}
                  />
                  <span style={{ fontWeight: 'bold' }}>{f}</span>
                </label>
              ))}
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#666', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 10px' }}>
              {Object.keys(flags).filter(f => flags[f]).map(f => (
                <React.Fragment key={f}>
                  <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{f}</span>
                  <span>{FLAG_INFO[f].desc}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        {error && <div style={{ color: 'red', marginTop: '5px' }}>Error: {error}</div>}
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Test String:</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            style={{ width: '100%', minHeight: '150px', padding: '10px', fontFamily: 'monospace', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Match Preview:</label>
          <div style={{ 
            width: '100%', 
            minHeight: '150px', 
            padding: '10px', 
            fontFamily: 'monospace', 
            fontSize: '14px', 
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            backgroundColor: '#f9f9f9',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {renderHighlights()}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Match Details ({matches.length})</h3>
        {matches.length > 0 ? (
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ backgroundColor: '#f1f1f1' }}>
                <tr>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>#</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Match</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Index</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Groups</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{i + 1}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace', backgroundColor: '#fff3cd' }}>{m[0]}</td>
                    <td style={{ padding: '8px' }}>{m.index}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>
                      {m.length > 1 ? (
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {Array.from(m).slice(1).map((g, gi) => (
                            <li key={gi}>{gi + 1}: {g}</li>
                          ))}
                        </ul>
                      ) : <span style={{ color: '#999' }}>None</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: '#666', fontStyle: 'italic' }}>No matches found.</div>
        )}
      </div>
    </div>
  );
};

export default RegexVisualizer;
