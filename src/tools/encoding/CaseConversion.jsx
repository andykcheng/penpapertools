import React, { useState, useEffect } from 'react';

export const metadata = {
  id: 'case-conversion',
  name: 'Case Converter',
  description: 'Convert text between different cases (camel, snake, kebab, etc.)',
  category: 'encoding'
};

const CaseConversion = () => {
  const [input, setInput] = useState('Hello World example text');
  const [conversions, setConversions] = useState([]);

  useEffect(() => {
    convertAll(input);
  }, [input]);

  const getWords = (str) => {
    if (!str) return [];
    // Split by spaces, underscores, hyphens, or camelCase transitions
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to space
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // acronyms followed by word
      .replace(/[\W_]+/g, ' ') // non-alphanumeric to space
      .trim()
      .split(/\s+/);
  };

  const convertAll = (text) => {
    if (!text) {
      setConversions([]);
      return;
    }

    const words = getWords(text);
    const lowerWords = words.map(w => w.toLowerCase());
    const upperWords = words.map(w => w.toUpperCase());
    const titleWords = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

    const results = [
      { label: 'UPPERCASE', value: text.toUpperCase() },
      { label: 'lowercase', value: text.toLowerCase() },
      { label: 'Title Case', value: titleWords.join(' ') },
      { label: 'Sentence case', value: text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() },
      { label: 'camelCase', value: lowerWords.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('') },
      { label: 'PascalCase', value: titleWords.join('') },
      { label: 'snake_case', value: lowerWords.join('_') },
      { label: 'CONSTANT_CASE', value: upperWords.join('_') },
      { label: 'kebab-case', value: lowerWords.join('-') },
      { label: 'COBOL-CASE', value: upperWords.join('-') },
      { label: 'dot.case', value: lowerWords.join('.') },
      { label: 'path/case', value: lowerWords.join('/') },
      { label: 'Alternating Case', value: text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('') },
      { label: 'Inverse Case', value: text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('') },
    ];

    setConversions(results);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="tool-container">
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Input Text:</label>
        <textarea
          style={{ width: '100%', minHeight: '100px', padding: '10px', fontFamily: 'monospace' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to convert..."
        />
      </div>

      <div style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
        {conversions.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            padding: '10px 15px', 
            backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#fff',
            borderBottom: index < conversions.length - 1 ? '1px solid #eee' : 'none',
            alignItems: 'center'
          }}>
            <span style={{ width: '180px', fontWeight: 'bold', color: '#555', flexShrink: 0 }}>{item.label}</span>
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

export default CaseConversion;
