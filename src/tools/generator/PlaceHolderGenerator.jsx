import React, { useState, useRef, useEffect } from 'react';

export const metadata = {
  id: 'placeholder-generator',
  name: 'Placeholder Generator',
  description: 'Generate placeholder PNG or SVG with size text',
  category: 'generator'
};

const randColor = () => {
  const r = () => Math.floor(Math.random() * 200) + 20;
  return `rgb(${r()}, ${r()}, ${r()})`;
};

const escapeXml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

function toHex(color) {
  if (!color) return '#000000';
  if (color.startsWith('#')) return color;
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10);
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  return color;
}

const PlaceHolderGenerator = () => {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [bg, setBg] = useState('#cccccc');
  const [fg, setFg] = useState('#333333');
  const [text, setText] = useState('');
  const [format, setFormat] = useState('png'); // 'png' or 'svg'
  const [filename, setFilename] = useState('placeholder');

  const canvasRef = useRef(null);
  const [svgString, setSvgString] = useState('');
  const [dataUrl, setDataUrl] = useState('');

  const getDisplayText = () => (text.trim() ? text : `${width}×${height}`);

  const buildSvg = () => {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    const display = escapeXml(getDisplayText());
    const fontSize = Math.max(12, Math.floor(Math.min(w, h) / 6));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="${bg}" />
  <text x="50%" y="50%" fill="${fg}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" dominant-baseline="middle" text-anchor="middle">${display}</text>
</svg>`;
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // text
    const display = getDisplayText();
    const fontSize = Math.max(12, Math.floor(Math.min(w, h) / 6));
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`;
    ctx.fillText(display, w / 2, h / 2);
    const url = canvas.toDataURL('image/png');
    setDataUrl(url);
  };

  useEffect(() => {
    if (format === 'png') {
      renderCanvas();
      setSvgString('');
    } else {
      const svg = buildSvg();
      setSvgString(svg);
      setDataUrl('data:image/svg+xml;utf8,' + encodeURIComponent(svg));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, bg, fg, text, format]);

  const downloadPng = () => {
    renderCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${filename || 'placeholder'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadSvg = () => {
    const svg = buildSvg();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename || 'placeholder'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyDataUrl = async () => {
    if (!dataUrl) return;
    try {
      await navigator.clipboard.writeText(dataUrl);
    } catch (e) {
      // ignore
    }
  };

  const clear = () => {
    setWidth(600);
    setHeight(400);
    setBg('#cccccc');
    setFg('#333333');
    setText('');
    setFilename('placeholder');
    setDataUrl('');
    setSvgString('');
  };

  return (
    <div className="tool-container">
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ minWidth: 280, flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Width (px)</label>
          <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 0)} style={{ width: '100%', padding: 8, marginBottom: 10 }} />

          <label style={{ display: 'block', marginBottom: 6 }}>Height (px)</label>
          <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 0)} style={{ width: '100%', padding: 8, marginBottom: 10 }} />

          <label style={{ display: 'block', marginBottom: 6 }}>Background Color</label>
          <input type="color" value={toHex(bg)} onChange={(e) => setBg(e.target.value)} style={{ width: '100%', padding: 6, height: 40, marginBottom: 10 }} />

          <label style={{ display: 'block', marginBottom: 6 }}>Text Color</label>
          <input type="color" value={toHex(fg)} onChange={(e) => setFg(e.target.value)} style={{ width: '100%', padding: 6, height: 40, marginBottom: 10 }} />

          <label style={{ display: 'block', marginBottom: 6 }}>Text (optional)</label>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={`${width}×${height}`} style={{ width: '100%', padding: 8, marginBottom: 10 }} />

          <label style={{ display: 'block', marginBottom: 6 }}>Filename</label>
          <input type="text" value={filename} onChange={(e) => setFilename(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 10 }} />

          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button onClick={() => { setBg(randColor()); setFg('#ffffff'); }} style={{ padding: '8px 12px' }}>Random Colors</button>
            <button onClick={clear} style={{ padding: '8px 12px' }}>Reset</button>
          </div>
        </div>

        <div style={{ minWidth: 320, flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 10 }}>
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
          </select>

          <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: 10, textAlign: 'center', background: '#fff' }}>
            {format === 'png' ? (
              <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', border: '1px solid #eee' }} />
            ) : (
              <div style={{ display: 'inline-block', border: '1px solid #eee' }} dangerouslySetInnerHTML={{ __html: svgString || buildSvg() }} />
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => { if (format === 'png') downloadPng(); else downloadSvg(); }} style={{ padding: '8px 12px' }}>
              Download {format.toUpperCase()}
            </button>
            <button onClick={copyDataUrl} style={{ padding: '8px 12px' }}>Copy Data URL</button>
            <button onClick={() => { setText(getDisplayText()); }} style={{ padding: '8px 12px' }}>Use Size Text</button>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            Preview shows current settings. PNG uses device pixel ratio for crisp output.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceHolderGenerator;
