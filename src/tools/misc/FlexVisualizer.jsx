import React, { useState } from 'react';

export const metadata = {
  id: 'flex-visualizer',
  name: 'Flexbox Visualizer',
  description: 'Visualize CSS Flexbox properties interactively',
  category: 'misc'
};

const FlexVisualizer = () => {
  const [direction, setDirection] = useState('row');
  const [justify, setJustify] = useState('flex-start');
  const [align, setAlign] = useState('stretch');
  const [wrap, setWrap] = useState('nowrap');
  const [itemCount, setItemCount] = useState(4);

  const containerStyle = {
    display: 'flex',
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align,
    flexWrap: wrap,
    height: '400px',
    width: '100%',
    backgroundColor: '#f0f2f5',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '10px',
    boxSizing: 'border-box',
    overflow: 'auto'
  };

  const itemStyle = {
    width: '80px',
    height: '80px',
    backgroundColor: '#61dafb',
    color: '#282c34',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '5px',
    borderRadius: '4px',
    border: '1px solid #20232a'
  };

  // Helper to generate options
  const RadioGroup = ({ label, value, onChange, options }) => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {options.map(opt => (
          <label key={opt} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <input 
              type="radio" 
              name={label} 
              value={opt} 
              checked={value === opt} 
              onChange={(e) => onChange(e.target.value)}
              style={{ marginRight: '4px' }}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="tool-container">
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ flex: 1, minWidth: '300px', padding: '15px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
          <h3>Controls</h3>
          
          <RadioGroup 
            label="flex-direction" 
            value={direction} 
            onChange={setDirection} 
            options={['row', 'row-reverse', 'column', 'column-reverse']} 
          />

          <RadioGroup 
            label="justify-content (Main Axis)" 
            value={justify} 
            onChange={setJustify} 
            options={['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']} 
          />

          <RadioGroup 
            label="align-items (Cross Axis)" 
            value={align} 
            onChange={setAlign} 
            options={['stretch', 'flex-start', 'flex-end', 'center', 'baseline']} 
          />

          <RadioGroup 
            label="flex-wrap" 
            value={wrap} 
            onChange={setWrap} 
            options={['nowrap', 'wrap', 'wrap-reverse']} 
          />

          <div style={{ marginTop: '20px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Items:</label>
            <button onClick={() => setItemCount(Math.max(1, itemCount - 1))} style={{ padding: '5px 10px' }}>-</button>
            <span style={{ margin: '0 10px' }}>{itemCount}</span>
            <button onClick={() => setItemCount(Math.min(20, itemCount + 1))} style={{ padding: '5px 10px' }}>+</button>
          </div>
        </div>

        <div style={{ flex: 2, minWidth: '300px' }}>
          <h3>Preview</h3>
          <div style={containerStyle}>
            {[...Array(itemCount)].map((_, i) => (
              <div key={i} style={{
                ...itemStyle,
                // Vary height slightly for baseline/stretch visualization
                height: align === 'baseline' || align === 'stretch' ? (align === 'stretch' ? 'auto' : `${60 + (i % 3) * 20}px`) : '80px',
                minHeight: '50px'
              }}>
                {i + 1}
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#282c34', color: '#abb2bf', borderRadius: '4px', fontFamily: 'monospace' }}>
            <div>.container {'{'}</div>
            <div style={{ paddingLeft: '20px' }}>display: flex;</div>
            <div style={{ paddingLeft: '20px' }}>flex-direction: <span style={{ color: '#98c379' }}>{direction}</span>;</div>
            <div style={{ paddingLeft: '20px' }}>justify-content: <span style={{ color: '#98c379' }}>{justify}</span>;</div>
            <div style={{ paddingLeft: '20px' }}>align-items: <span style={{ color: '#98c379' }}>{align}</span>;</div>
            <div style={{ paddingLeft: '20px' }}>flex-wrap: <span style={{ color: '#98c379' }}>{wrap}</span>;</div>
            <div>{'}'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexVisualizer;
