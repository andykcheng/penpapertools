import React, { useState } from 'react';
import { v1 as uuidv1, v3 as uuidv3, v4 as uuidv4, v5 as uuidv5, validate as uuidValidate } from 'uuid';

export const metadata = {
  id: 'uuid-generator',
  name: 'UUID Generator',
  description: 'Generate UUIDs (v1, v3, v4, v5)',
  category: 'generator'
};

const NAMESPACES = {
  DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
};

const UUIDGenerator = () => {
  const [version, setVersion] = useState('v4');
  const [quantity, setQuantity] = useState(1);
  const [namespaceType, setNamespaceType] = useState('DNS');
  const [customNamespace, setCustomNamespace] = useState('');
  const [name, setName] = useState('');
  const [generated, setGenerated] = useState([]);
  const [error, setError] = useState(null);

  const handleGenerate = () => {
    setError(null);
    const newUuids = [];
    try {
      for (let i = 0; i < quantity; i++) {
        if (version === 'v1') {
          newUuids.push(uuidv1());
        } else if (version === 'v4') {
          newUuids.push(uuidv4());
        } else if (version === 'v3' || version === 'v5') {
          if (!name) throw new Error('Name is required for v3/v5');
          
          let ns = NAMESPACES[namespaceType];
          if (namespaceType === 'Custom') {
            if (!uuidValidate(customNamespace)) throw new Error('Invalid Custom Namespace UUID');
            ns = customNamespace;
          }
          
          const generator = version === 'v3' ? uuidv3 : uuidv5;
          // v3/v5 are deterministic based on input. To generate distinct UUIDs, we modify the name.
          const inputName = quantity > 1 ? `${name}-${i + 1}` : name;
          newUuids.push(generator(inputName, ns));
        }
      }
      setGenerated(newUuids);
    } catch (err) {
      setError(err.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="tool-container">
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Version:</label>
          <select 
            value={version} 
            onChange={(e) => setVersion(e.target.value)}
            style={{ padding: '8px', minWidth: '150px' }}
          >
            <option value="v4">v4 (Random)</option>
            <option value="v1">v1 (Timestamp)</option>
            <option value="v3">v3 (MD5 Namespace)</option>
            <option value="v5">v5 (SHA-1 Namespace)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Quantity:</label>
          <input 
            type="number" 
            min="1" 
            max="100" 
            value={quantity} 
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            style={{ padding: '8px', width: '80px' }}
          />
        </div>
      </div>

      {(version === 'v3' || version === 'v5') && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Namespace:</label>
            <select 
              value={namespaceType} 
              onChange={(e) => setNamespaceType(e.target.value)}
              style={{ padding: '8px', marginRight: '10px' }}
            >
              {Object.keys(NAMESPACES).map(k => <option key={k} value={k}>{k}</option>)}
              <option value="Custom">Custom UUID</option>
            </select>
            {namespaceType === 'Custom' && (
              <input 
                type="text" 
                value={customNamespace} 
                onChange={(e) => setCustomNamespace(e.target.value)}
                placeholder="Enter valid UUID"
                style={{ padding: '8px', width: '300px' }}
              />
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name (e.g. www.example.com)"
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          {quantity > 1 && (
            <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666', fontStyle: 'italic' }}>
              * For multiple v3/v5 UUIDs, a suffix (-1, -2, etc.) is automatically appended to the name to ensure uniqueness.
            </div>
          )}
        </div>
      )}

      <button 
        onClick={handleGenerate}
        style={{ padding: '8px 16px', cursor: 'pointer', marginBottom: '20px' }}
      >
        Generate UUIDs
      </button>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
      )}

      {generated.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label>Results:</label>
            <button 
              onClick={() => copyToClipboard(generated.join('\n'))}
              style={{ padding: '4px 8px', fontSize: '0.9em' }}
            >
              Copy All
            </button>
          </div>
          <textarea
            readOnly
            value={generated.join('\n')}
            style={{ width: '100%', minHeight: '200px', padding: '10px', fontFamily: 'monospace' }}
          />
        </div>
      )}
    </div>
  );
};

export default UUIDGenerator;
