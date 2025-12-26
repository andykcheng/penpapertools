import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export const metadata = {
  id: 'qrcode-generator',
  name: 'QR Code Generator',
  description: 'Generate QR Codes for text, URLs, and WiFi',
  category: 'generator'
};

const QRCodeGenerator = () => {
  const [type, setType] = useState('text');
  const [text, setText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // Contact (vCard)
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactOrg, setContactOrg] = useState('');
  const [contactTitle, setContactTitle] = useState('');

  // SMS
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  // Email
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Geo
  const [geoLat, setGeoLat] = useState('');
  const [geoLon, setGeoLon] = useState('');

  // Event
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');

  // Crypto (Bitcoin)
  const [btcAddress, setBtcAddress] = useState('');
  const [btcAmount, setBtcAmount] = useState('');
  
  const [version, setVersion] = useState(0); // 0 = Auto
  const [ecc, setEcc] = useState('M');
  const [transparent, setTransparent] = useState(false);
  const [error, setError] = useState(null);
  
  const canvasRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    generateQR();
  }, [type, text, wifiSsid, wifiPass, wifiEnc, wifiHidden, version, ecc, transparent,
      contactName, contactPhone, contactEmail, contactOrg, contactTitle,
      smsPhone, smsMessage,
      emailTo, emailSubject, emailBody,
      geoLat, geoLon,
      eventTitle, eventLocation, eventStart, eventEnd,
      btcAddress, btcAmount
  ]);

  const getDataString = () => {
    if (['text', 'url', 'app', 'pdf', 'social'].includes(type)) {
      return text;
    }
    if (type === 'wifi') {
      // Escape special characters: \ ; , :
      const escape = (str) => str.replace(/([\\;,":])/g, '\\$1');
      const s = escape(wifiSsid);
      const p = escape(wifiPass);
      const t = wifiEnc;
      const h = wifiHidden ? 'true' : 'false';
      return `WIFI:T:${t};S:${s};P:${p};H:${h};;`;
    }
    if (type === 'vcard') {
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nORG:${contactOrg}\nTITLE:${contactTitle}\nEND:VCARD`;
    }
    if (type === 'sms') {
      return `SMSTO:${smsPhone}:${smsMessage}`;
    }
    if (type === 'email') {
      return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    }
    if (type === 'geo') {
      return `geo:${geoLat},${geoLon}`;
    }
    if (type === 'event') {
      const formatTime = (dt) => dt ? new Date(dt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : '';
      return `BEGIN:VEVENT\nSUMMARY:${eventTitle}\nLOCATION:${eventLocation}\nDTSTART:${formatTime(eventStart)}\nDTEND:${formatTime(eventEnd)}\nEND:VEVENT`;
    }
    if (type === 'bitcoin') {
      return `bitcoin:${btcAddress}${btcAmount ? `?amount=${btcAmount}` : ''}`;
    }
    return '';
  };

  const generateQR = async () => {
    const data = getDataString();
    if (!data) {
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setError(null);
      return;
    }

    const options = {
      errorCorrectionLevel: ecc,
      margin: 4,
      width: 300,
      color: {
        dark: '#000000',
        light: transparent ? '#00000000' : '#ffffff'
      }
    };

    if (version > 0) {
      options.version = version;
    }

    try {
      setError(null);
      // Generate to Canvas
      await QRCode.toCanvas(canvasRef.current, data, options);
      
      // Generate SVG string for download
      const svg = await QRCode.toString(data, { ...options, type: 'svg' });
      setSvgContent(svg);
    } catch (err) {
      setError(err.message);
      // Clear canvas on error
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = url;
    link.click();
  };

  const downloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'qrcode.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPlaceholder = () => {
    switch(type) {
      case 'url': return "https://example.com";
      case 'app': return "https://apps.apple.com/app/id...";
      case 'pdf': return "https://example.com/menu.pdf";
      case 'social': return "https://linktr.ee/username";
      default: return "Enter text here";
    }
  };

  return (
    <div className="tool-container">
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Type:</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              style={{ padding: '8px', width: '100%' }}
            >
              <option value="text">Plain Text</option>
              <option value="url">URL / Website</option>
              <option value="vcard">vCard (Contact)</option>
              <option value="wifi">WiFi Network</option>
              <option value="sms">SMS Message</option>
              <option value="email">Email</option>
              <option value="geo">Geolocation (Maps)</option>
              <option value="event">Event (vCalendar)</option>
              <option value="bitcoin">Bitcoin Payment</option>
              <option value="app">App Store Link</option>
              <option value="pdf">PDF / File Link</option>
              <option value="social">Social Media</option>
            </select>
          </div>

          {['text', 'url', 'app', 'pdf', 'social'].includes(type) && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Content:</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={getPlaceholder()}
                style={{ width: '100%', minHeight: '100px', padding: '8px' }}
              />
            </div>
          )}

          {type === 'vcard' && (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <input type="text" placeholder="Full Name" value={contactName} onChange={e => setContactName(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input type="text" placeholder="Phone Number" value={contactPhone} onChange={e => setContactPhone(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input type="email" placeholder="Email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input type="text" placeholder="Organization" value={contactOrg} onChange={e => setContactOrg(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input type="text" placeholder="Title" value={contactTitle} onChange={e => setContactTitle(e.target.value)} style={{ width: '100%', padding: '8px' }} />
            </div>
          )}

          {type === 'sms' && (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <input type="text" placeholder="Phone Number" value={smsPhone} onChange={e => setSmsPhone(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <textarea placeholder="Message" value={smsMessage} onChange={e => setSmsMessage(e.target.value)} style={{ width: '100%', padding: '8px', minHeight: '80px' }} />
            </div>
          )}

          {type === 'email' && (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <input type="email" placeholder="To Email" value={emailTo} onChange={e => setEmailTo(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input type="text" placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <textarea placeholder="Body" value={emailBody} onChange={e => setEmailBody(e.target.value)} style={{ width: '100%', padding: '8px', minHeight: '80px' }} />
            </div>
          )}

          {type === 'geo' && (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <input type="text" placeholder="Latitude" value={geoLat} onChange={e => setGeoLat(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input type="text" placeholder="Longitude" value={geoLon} onChange={e => setGeoLon(e.target.value)} style={{ width: '100%', padding: '8px' }} />
            </div>
          )}

          {type === 'event' && (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <input type="text" placeholder="Event Title" value={eventTitle} onChange={e => setEventTitle(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input type="text" placeholder="Location" value={eventLocation} onChange={e => setEventLocation(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <label style={{display:'block', fontSize:'0.8em'}}>Start:</label>
              <input type="datetime-local" value={eventStart} onChange={e => setEventStart(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <label style={{display:'block', fontSize:'0.8em'}}>End:</label>
              <input type="datetime-local" value={eventEnd} onChange={e => setEventEnd(e.target.value)} style={{ width: '100%', padding: '8px' }} />
            </div>
          )}

          {type === 'bitcoin' && (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <input type="text" placeholder="Bitcoin Address" value={btcAddress} onChange={e => setBtcAddress(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input type="number" placeholder="Amount (BTC)" value={btcAmount} onChange={e => setBtcAmount(e.target.value)} style={{ width: '100%', padding: '8px' }} />
            </div>
          )}

          {type === 'wifi' && (
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>SSID (Network Name):</label>
                <input 
                  type="text" 
                  value={wifiSsid} 
                  onChange={(e) => setWifiSsid(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                <input 
                  type="text" 
                  value={wifiPass} 
                  onChange={(e) => setWifiPass(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Encryption:</label>
                  <select 
                    value={wifiEnc} 
                    onChange={(e) => setWifiEnc(e.target.value)}
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <label style={{ cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={wifiHidden} 
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      style={{ marginRight: '5px' }}
                    />
                    Hidden Network
                  </label>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Options</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Version:</label>
                <select 
                  value={version} 
                  onChange={(e) => setVersion(parseInt(e.target.value))}
                  style={{ padding: '5px' }}
                >
                  <option value={0}>Auto</option>
                  {[...Array(40)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>ECC Level:</label>
                <select 
                  value={ecc} 
                  onChange={(e) => setEcc(e.target.value)}
                  style={{ padding: '5px' }}
                >
                  <option value="L">L (Low ~7%)</option>
                  <option value="M">M (Medium ~15%)</option>
                  <option value="Q">Q (Quartile ~25%)</option>
                  <option value="H">H (High ~30%)</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                <label style={{ cursor: 'pointer', fontSize: '0.9em' }}>
                  <input 
                    type="checkbox" 
                    checked={transparent} 
                    onChange={(e) => setTransparent(e.target.checked)}
                    style={{ marginRight: '5px' }}
                  />
                  Transparent Background
                </label>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <div style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            background: transparent ? 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC41ZY743wAAABhJREFUOE9jBP7///9/GMYcOHAgA200AgC1wH/9g791OAAAAABJRU5ErkJggg==")' : '#fff',
            marginBottom: '10px'
          }}>
            <canvas ref={canvasRef} />
          </div>
          
          {error && (
            <div style={{ color: 'red', marginBottom: '10px', maxWidth: '300px', textAlign: 'center' }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={downloadPng}
              disabled={!!error}
              style={{ padding: '8px 16px', cursor: error ? 'not-allowed' : 'pointer' }}
            >
              Download PNG
            </button>
            <button 
              onClick={downloadSvg}
              disabled={!!error}
              style={{ padding: '8px 16px', cursor: error ? 'not-allowed' : 'pointer' }}
            >
              Download SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
