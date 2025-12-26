import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TOOLS = [
  // Viewer
  { id: 'json-viewer', name: 'JSON Viewer', description: 'View and format JSON data', category: 'viewer' },
  { id: 'yaml-viewer', name: 'YAML Viewer', description: 'View and format YAML data', category: 'viewer' },
  { id: 'toml-viewer', name: 'TOML Viewer', description: 'View and format TOML data', category: 'viewer' },
  { id: 'jwt-viewer', name: 'JWT Viewer', description: 'Decode and verify JSON Web Tokens', category: 'viewer' },
  { id: 'json-table-viewer', name: 'JSON Table Viewer', description: 'View JSON array as a table and export to CSV', category: 'viewer' },
  
  // Encoding
  { id: 'text-to-base64', name: 'Text to Base64', description: 'Convert text to Base64 string', category: 'encoding' },
  { id: 'file-to-base64', name: 'File to Base64', description: 'Convert a file to Base64 string', category: 'encoding' },
  { id: 'base64-to-file', name: 'Base64 to File', description: 'Convert Base64 string to file download', category: 'encoding' },
  { id: 'url-encoding', name: 'URL Encoder/Decoder', description: 'Encode or decode URL strings', category: 'encoding' },
  { id: 'case-conversion', name: 'Case Converter', description: 'Convert text between different cases', category: 'encoding' },

  // Encryption
  { id: 'aes-encryption', name: 'AES Encryption', description: 'Encrypt and decrypt text using AES-GCM', category: 'encryption' },

  // Generator
  { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate UUIDs (v1, v3, v4, v5)', category: 'generator' },
  { id: 'qrcode-generator', name: 'QR Code Generator', description: 'Generate QR Codes for text, URLs, WiFi, etc.', category: 'generator' },
  { id: 'chart-generator', name: 'Chart Generator', description: 'Generate random charts for placeholders', category: 'generator' },
  { id: 'placeholder-generator', name: 'Placeholder Generator', description: 'Generate placeholder PNG/SVG images', category: 'generator' },
  { id: 'password-generator', name: 'Password Generator', description: 'Generate secure passwords', category: 'generator' },
  { id: 'crontab-generator', name: 'Crontab Generator', description: 'Generate and explain cron expressions', category: 'generator' },
  { id: 'docker-compose-generator', name: 'Docker Compose Generator', description: 'Convert docker run to docker-compose', category: 'generator' },
  { id: 'jwt-generator', name: 'JWT Generator', description: 'Generate signed JWT tokens', category: 'tokens' }, // Note: category might be 'tokens' or 'generator' based on file path

  // Time
  { id: 'time-parser', name: 'Time Parser', description: 'Parse timestamps and date strings', category: 'time' },
  { id: 'time-display', name: 'Current Time', description: 'Display current time in various formats', category: 'time' },

  // Misc
  { id: 'flex-visualizer', name: 'Flexbox Visualizer', description: 'Visualize CSS Flexbox properties', category: 'misc' },
];

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = TOOLS.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>Welcome to Pen Paper Tools</h1>
        <p style={{ fontSize: '1.1em', color: '#666' }}>A collection of developer tools for your daily tasks.</p>
        
        <input
          type="text"
          placeholder="Search tools (e.g., json, uuid, time)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '12px 20px',
            width: '100%',
            maxWidth: '500px',
            fontSize: '16px',
            borderRadius: '25px',
            border: '1px solid #ddd',
            marginTop: '20px',
            outline: 'none',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredTools.map(tool => (
          <Link 
            key={tool.id} 
            to={`/tools/${tool.category}/${tool.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ 
              border: '1px solid #eee', 
              borderRadius: '8px', 
              padding: '20px', 
              height: '100%',
              backgroundColor: '#fff',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}
            >
              <div style={{ 
                textTransform: 'uppercase', 
                fontSize: '0.75em', 
                color: '#888', 
                marginBottom: '10px',
                fontWeight: 'bold'
              }}>
                {tool.category}
              </div>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{tool.name}</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '0.95em', lineHeight: '1.4' }}>
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>
          No tools found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default HomePage;
