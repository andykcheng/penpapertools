import React, { useState } from 'react';
import yaml from 'js-yaml';

export const metadata = {
  id: 'docker-compose-generator',
  name: 'Docker Compose Generator',
  description: 'Convert docker run commands to docker-compose.yml',
  category: 'generator'
};

const DockerComposeGenerator = () => {
  const [input, setInput] = useState('docker run -d --name my-web-server -p 80:80 -v /host/data:/usr/share/nginx/html -e ENV=production nginx:latest');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);

  const parseCommand = (cmdStr) => {
    // Remove backslashes used for line continuation
    const cleanCmd = cmdStr.replace(/\\\n/g, ' ').replace(/\\/g, '');
    
    // Tokenize respecting quotes
    const tokens = [];
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    let match;
    while ((match = regex.exec(cleanCmd)) !== null) {
      tokens.push(match[1] || match[2] || match[0]);
    }

    if (tokens.length < 3 || tokens[0] !== 'docker' || tokens[1] !== 'run') {
      throw new Error('Input must start with "docker run"');
    }

    const service = {};
    let image = null;
    let commandArgs = [];
    let containerName = 'app';

    // Flags that take an argument
    const argFlags = [
      '-p', '--publish',
      '-v', '--volume',
      '-e', '--env',
      '--name',
      '--restart',
      '--network', '--net',
      '--hostname', '-h',
      '--user', '-u',
      '--workdir', '-w',
      '--entrypoint'
    ];

    // Boolean flags (no argument)
    const boolFlags = [
      '-d', '--detach',
      '-i', '--interactive',
      '-t', '--tty',
      '--rm',
      '--privileged',
      '-P', '--publish-all'
    ];

    for (let i = 2; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.startsWith('-')) {
        // Check if it's a known flag with argument
        if (argFlags.includes(token)) {
          const value = tokens[++i];
          if (value === undefined) continue; // End of string

          switch (token) {
            case '-p':
            case '--publish':
              service.ports = service.ports || [];
              service.ports.push(value);
              break;
            case '-v':
            case '--volume':
              service.volumes = service.volumes || [];
              service.volumes.push(value);
              break;
            case '-e':
            case '--env':
              service.environment = service.environment || [];
              service.environment.push(value);
              break;
            case '--name':
              containerName = value;
              service.container_name = value;
              break;
            case '--restart':
              service.restart = value;
              break;
            case '--network':
            case '--net':
              service.networks = service.networks || [];
              service.networks.push(value);
              break;
            case '--hostname':
            case '-h':
              service.hostname = value;
              break;
            case '--user':
            case '-u':
              service.user = value;
              break;
            case '--workdir':
            case '-w':
              service.working_dir = value;
              break;
            case '--entrypoint':
              service.entrypoint = value;
              break;
          }
        } else if (boolFlags.includes(token)) {
          if (token === '--privileged') service.privileged = true;
          // Ignore others like -d, -it, --rm for compose usually
        } else {
          // Unknown flag, assume boolean or ignore? 
          // If it looks like a combined short flag (e.g. -it), ignore
        }
      } else {
        // Not a flag
        if (!image) {
          image = token;
        } else {
          commandArgs.push(token);
        }
      }
    }

    if (!image) throw new Error('Could not identify image name');

    service.image = image;
    if (commandArgs.length > 0) {
      service.command = commandArgs.join(' '); // Simple join
    }

    const compose = {
      version: '3.8',
      services: {
        [containerName]: service
      }
    };

    return yaml.dump(compose);
  };

  const handleConvert = () => {
    try {
      const result = parseCommand(input);
      setOutput(result);
      setError(null);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const commonCommands = [
    { cmd: 'docker-compose up -d', desc: 'Start services in background' },
    { cmd: 'docker-compose up --build', desc: 'Build images before starting containers' },
    { cmd: 'docker-compose down', desc: 'Stop and remove containers, networks' },
    { cmd: 'docker-compose down --remove-orphans', desc: 'Remove containers for services not defined in the Compose file' },
    { cmd: 'docker-compose down -v', desc: 'Remove named volumes declared in the `volumes` section' },
    { cmd: 'docker-compose logs -f', desc: 'Follow log output' },
    { cmd: 'docker-compose ps', desc: 'List containers' },
    { cmd: 'docker-compose restart', desc: 'Restart services' },
  ];

  return (
    <div className="tool-container">
      <h2>Docker Compose Generator</h2>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Docker Run Command:</label>
        <textarea
          style={{ width: '100%', minHeight: '120px', fontFamily: 'monospace', padding: '10px' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="docker run ..."
        />
      </div>
      
      <button 
        onClick={handleConvert}
        style={{ padding: '8px 16px', cursor: 'pointer', marginBottom: '20px' }}
      >
        Generate YAML
      </button>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {output && (
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>docker-compose.yml:</label>
          <textarea
            readOnly
            style={{ width: '100%', minHeight: '300px', fontFamily: 'monospace', padding: '10px', backgroundColor: '#f5f5f5' }}
            value={output}
          />
          
          <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3>Common Operations</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {commonCommands.map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <code style={{ fontWeight: 'bold', marginBottom: '5px' }}>{item.cmd}</code>
                  <span style={{ fontSize: '0.9em', color: '#666' }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DockerComposeGenerator;
