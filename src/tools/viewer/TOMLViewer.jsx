import React, { useState } from 'react';
import toml from 'toml';

export const metadata = {
  id: 'toml-viewer',
  name: 'TOML Viewer',
  description: 'View and format TOML data',
  category: 'viewer'
};

const JsonItem = ({ name, value, isLast, initialExpanded = true }) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  if (!isObject) {
    let displayValue = JSON.stringify(value);
    let color = '#d19a66'; // string color
    if (typeof value === 'number') color = '#61aeee';
    if (typeof value === 'boolean') color = '#c678dd';
    if (value === null) color = '#56b6c2';

    return (
      <div style={{ paddingLeft: '20px' }}>
        {name && <span style={{ color: '#e06c75' }}>"{name}": </span>}
        <span style={{ color }}>{displayValue}</span>
        {!isLast && <span>,</span>}
      </div>
    );
  }

  const keys = Object.keys(value);
  const startBracket = isArray ? '[' : '{';
  const endBracket = isArray ? ']' : '}';

  return (
    <div style={{ paddingLeft: name ? '20px' : '0px' }}>
      <div>
        <span 
          onClick={() => setExpanded(!expanded)} 
          style={{ cursor: 'pointer', display: 'inline-block', marginRight: '5px', color: '#abb2bf', userSelect: 'none' }}
        >
          {expanded ? '▼' : '▶'}
        </span>
        {name && <span style={{ color: '#e06c75' }}>"{name}": </span>}
        <span 
          onClick={() => setExpanded(!expanded)} 
          style={{ cursor: 'pointer', fontWeight: 'bold' }}
        >
          {startBracket}
          {!expanded && <span style={{ color: '#abb2bf', fontWeight: 'normal' }}> ... {endBracket}</span>}
        </span>
        {!expanded && !isLast && <span>,</span>}
      </div>
      
      {expanded && (
        <div>
          {keys.map((key, index) => (
            <JsonItem 
              key={key} 
              name={isArray ? null : key} 
              value={value[key]} 
              isLast={index === keys.length - 1} 
              initialExpanded={initialExpanded}
            />
          ))}
          <div>{endBracket}{!isLast && <span>,</span>}</div>
        </div>
      )}
    </div>
  );
};

const EXAMPLES = {
  tree: {
    label: 'Nested Tree',
    value: `[root]
id = 1
name = "Project X"

[[root.files]]
id = 2
name = "readme.md"

[[root.files]]
id = 3
name = "config.json"

[[root.subfolders]]
id = 4
name = "src"

[[root.subfolders.files]]
id = 5
name = "index.js"`
  },
  array: {
    label: 'Array of Objects (Table Array)',
    value: `[[users]]
id = 101
user = "Alice"
roles = ["admin", "editor"]

[[users]]
id = 102
user = "Bob"
roles = ["viewer"]

[[users]]
id = 103
user = "Charlie"
active = false`
  }
};

const TOMLViewer = () => {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [expandAll, setExpandAll] = useState(true);
  const [viewKey, setViewKey] = useState(0);

  const handleClear = () => {
    setInput('');
    setParsedData(null);
    setError(null);
  };

  const loadExample = (e) => {
    const key = e.target.value;
    if (EXAMPLES[key]) {
      setInput(EXAMPLES[key].value);
      setParsedData(null);
      setError(null);
    }
  };

  const handleParse = () => {
    if (!input.trim()) {
      setParsedData(null);
      setError(null);
      return;
    }
    try {
      const parsed = toml.parse(input);
      setParsedData(parsed);
      setError(null);
      setExpandAll(true);
      setViewKey(prev => prev + 1);
    } catch (err) {
      setError(err.message);
      setParsedData(null);
    }
  };

  const toggleExpandAll = (shouldExpand) => {
    setExpandAll(shouldExpand);
    setViewKey(prev => prev + 1);
  };

  return (
    <div className="tool-container">
      <h2>TOML Viewer</h2>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <select onChange={loadExample} style={{ padding: '5px' }}>
            <option value="">Select an example...</option>
            {Object.keys(EXAMPLES).map(key => (
              <option key={key} value={key}>{EXAMPLES[key].label}</option>
            ))}
          </select>
        </div>
        <textarea
          style={{ width: '100%', minHeight: '150px', fontFamily: 'monospace', padding: '10px' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your TOML here..."
        />
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={handleParse}
            style={{ padding: '8px 16px', cursor: 'pointer', marginRight: '10px' }}
          >
            Parse TOML
          </button>
          <button 
            onClick={handleClear}
            style={{ padding: '8px 16px', cursor: 'pointer', marginRight: '10px' }}
          >
            Clear
          </button>
          {parsedData && (
            <>
              <button 
                onClick={() => toggleExpandAll(true)}
                style={{ padding: '8px 16px', cursor: 'pointer', marginRight: '10px' }}
              >
                Expand All
              </button>
              <button 
                onClick={() => toggleExpandAll(false)}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Collapse All
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {parsedData !== null && (
        <div style={{ 
          backgroundColor: '#282c34', 
          color: '#abb2bf', 
          padding: '20px', 
          borderRadius: '4px', 
          fontFamily: 'monospace',
          overflowX: 'auto'
        }}>
          <JsonItem 
            key={viewKey} 
            value={parsedData} 
            isLast={true} 
            initialExpanded={expandAll} 
          />
        </div>
      )}
    </div>
  );
};

export default TOMLViewer;
