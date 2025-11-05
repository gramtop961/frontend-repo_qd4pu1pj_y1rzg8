import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Loader2, StopCircle } from 'lucide-react';

// Utility conversions
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max + min) / 2;

  if(max === min){
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s*100), l: Math.round(l*100) };
}

function clamp(val, min, max){ return Math.max(min, Math.min(max, val)); }

function analyzeToneFromImageData(image, ctx, width, height) {
  // Sample two cheek patches: left and right third, around middle lower region
  // Avoid eyes/lips by staying in mid-lower face band (55%-70% height)
  const patches = [];
  const patchSize = Math.max(20, Math.floor(Math.min(width, height) * 0.08));
  const y = Math.floor(height * 0.60) - Math.floor(patchSize/2);
  const xLeft = Math.floor(width * 0.33) - Math.floor(patchSize/2);
  const xRight = Math.floor(width * 0.66) - Math.floor(patchSize/2);
  patches.push({x: clamp(xLeft, 0, width-patchSize), y: clamp(y, 0, height-patchSize)});
  patches.push({x: clamp(xRight, 0, width-patchSize), y: clamp(y, 0, height-patchSize)});

  let sumR=0, sumG=0, sumB=0, count=0;
  patches.forEach(p => {
    const data = ctx.getImageData(p.x, p.y, patchSize, patchSize).data;
    for (let i=0; i<data.length; i+=4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const a = data[i+3];
      if (a < 200) continue; // skip transparent
      // Basic heuristic to avoid very saturated reds (lips) and dark areas (hair)
      if (r > 200 && g < 80 && b < 80) continue;
      if (r < 30 && g < 30 && b < 30) continue;
      sumR += r; sumG += g; sumB += b; count++;
    }
  });

  if (count === 0) return null;
  const avgR = Math.round(sumR / count);
  const avgG = Math.round(sumG / count);
  const avgB = Math.round(sumB / count);
  const hsl = rgbToHsl(avgR, avgG, avgB);

  // Determine warmth/cool/neutral
  let temperature = 'Neutral';
  if (hsl.h < 30 || hsl.h > 330) temperature = 'Warm';
  else if (hsl.h > 210 && hsl.h < 300) temperature = 'Cool';
  else temperature = 'Neutral';

  let depth = 'Medium';
  if (hsl.l >= 70) depth = 'Light';
  else if (hsl.l <= 30) depth = 'Deep';

  const season = mapToSeason(temperature, depth);

  return {
    avgRGB: { r: avgR, g: avgG, b: avgB },
    hsl,
    temperature,
    depth,
    season,
  };
}

function mapToSeason(temp, depth){
  // Simple 12-season mapping (subset names)
  const combos = {
    'Warm-Light': 'Spring Light',
    'Warm-Medium': 'Spring Warm Soft',
    'Warm-Deep': 'Autumn Warm Deep',
    'Cool-Light': 'Summer Cool Light',
    'Cool-Medium': 'Summer Cool Soft',
    'Cool-Deep': 'Winter Cool Deep',
    'Neutral-Light': 'Neutral Light',
    'Neutral-Medium': 'Neutral Soft',
    'Neutral-Deep': 'Neutral Deep',
  };
  return combos[`${temp}-${depth}`] || `${temp} ${depth}`;
}

function paletteForSeason(season){
  const presets = {
    'Spring Light': ['#FFD7A8','#FFB870','#FFC86B','#F2A65A','#E07A5F'],
    'Spring Warm Soft': ['#E8B478','#DFA06E','#B57E4F','#F1C27D','#F7D9AE'],
    'Autumn Warm Deep': ['#7B3F00','#A75D28','#C07D59','#8C5A3C','#4E342E'],
    'Summer Cool Light': ['#CFE8FF','#A7C7E7','#B5C3D6','#9CC9E3','#8FAECF'],
    'Summer Cool Soft': ['#9FB3C8','#7991A8','#6D8AA6','#88A2B8','#B2C1CD'],
    'Winter Cool Deep': ['#2D3A6B','#1E2A4A','#3F4C85','#0F172A','#64748B'],
    'Neutral Light': ['#F7EDE2','#EDE7E3','#E1DCD9','#F5F5F4','#E2E8F0'],
    'Neutral Soft': ['#C7C7C7','#B8B8B8','#A5A5A5','#D1D5DB','#94A3B8'],
    'Neutral Deep': ['#3B3B3B','#2F2F2F','#4B5563','#111827','#1F2937'],
  };
  return presets[season] || ['#E2E8F0','#CBD5E1','#94A3B8','#64748B','#475569'];
}

function outfitsForSeason(season){
  const common = {
    colors: [],
    outfits: ['Casual smart', 'Minimal street', 'Office-ready'],
    fabrics: ['Cotton', 'Linen'],
    message: 'Balance comfort with tones that enhance your undertone.'
  };
  const map = {
    'Spring Light': { colors: ['Peach','Warm beige','Coral','Camel','Soft teal'], fabrics:['Cotton','Light linen'], message:'Airy warm hues make you glow.' },
    'Spring Warm Soft': { colors: ['Apricot','Terracotta','Warm olive','Honey','Cream'], fabrics:['Linen','Chambray'], message:'Soft warm earth tones flatter you.'],
    'Autumn Warm Deep': { colors: ['Rust','Olive','Mustard','Chocolate','Teal'], fabrics:['Denim','Linen'], message:'Rich earthy colors complement depth.'],
    'Summer Cool Light': { colors: ['Powder blue','Lavender','Cool pink','Mint','Ice gray'], fabrics:['Poplin','Seersucker'], message:'Light cool pastels keep it fresh.'],
    'Summer Cool Soft': { colors: ['Dusty blue','Mauve','Soft plum','Steel','Sage'], fabrics:['Cotton','Light wool'], message:'Soft cool shades add harmony.'],
    'Winter Cool Deep': { colors: ['Navy','Charcoal','Cobalt','Burgundy','Black'], fabrics:['Merino','Sateen'], message:'Bold high-contrast colors pop.' },
  };
  return { ...common, ...(map[season] || {}) };
}

function hexToRgb(hex){
  const h = hex.replace('#','');
  const bigint = parseInt(h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function Analyzer({ onDone }){
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const stopStream = () => {
    const v = videoRef.current;
    if (v && v.srcObject) {
      v.srcObject.getTracks().forEach(t => t.stop());
      v.srcObject = null;
    }
    setStreaming(false);
  };

  const openCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (e) {
      setError('Camera access denied or unavailable.');
    }
  };

  const captureFromCamera = () => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas) return;
    const w = v.videoWidth;
    const h = v.videoHeight;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, w, h);
    const dataURL = canvas.toDataURL('image/png');
    setImgSrc(dataURL);
    stopStream();
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImgSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!imgSrc) return;
    setLoading(true); setError('');
    try {
      const img = new Image();
      img.src = imgSrc;
      await new Promise(res => { img.onload = res; img.onerror = res; });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const maxSide = 640;
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const result = analyzeToneFromImageData(img, ctx, canvas.width, canvas.height);
      if (!result) {
        setError('Could not detect a reliable skin region. Try a clearer, well-lit face.');
        setLoading(false);
        return;
      }
      const palette = paletteForSeason(result.season);
      const outfit = outfitsForSeason(result.season);

      const mainRgb = hexToRgb(palette[0]);
      const computed = {
        ...result,
        palette,
        outfit,
        previewColor: `rgb(${mainRgb.r}, ${mainRgb.g}, ${mainRgb.b})`
      };

      onDone?.(computed);
    } catch (e) {
      setError('Analysis failed. Please try a different photo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 text-sm cursor-pointer hover:bg-slate-800 transition">
                <ImageIcon size={18} /> Upload photo
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
              <button onClick={openCamera} className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-900 px-4 py-2 text-sm hover:bg-slate-200 transition">
                <Camera size={18} /> Use camera
              </button>
              {streaming && (
                <button onClick={stopStream} className="inline-flex items-center gap-2 rounded-full bg-rose-600 text-white px-3 py-2 text-xs hover:bg-rose-500 transition">
                  <StopCircle size={16} /> Stop
                </button>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                {streaming ? (
                  <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
                ) : imgSrc ? (
                  <img src={imgSrc} alt="preview" className="h-full w-full object-contain bg-white" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400">No image yet</div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">Tip: Use bright, even lighting and keep your face centered.</div>
                <button disabled={!imgSrc || loading} onClick={analyze} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-5 py-2 text-sm disabled:opacity-50 hover:bg-emerald-500 transition">
                  {loading && <Loader2 className="animate-spin" size={16} />} Analyze
                </button>
              </div>

              <AnimatePresence>
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="h-full w-1/3 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="text-sm text-rose-600">{error}</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-medium">How it works</h3>
            <ol className="mt-3 space-y-2 text-slate-600 list-decimal list-inside">
              <li>Capture or upload a clear face photo.</li>
              <li>We analyze cheek regions to estimate undertone and depth.</li>
              <li>We map the tone to a seasonal palette and suggest colors.</li>
              <li>No photo is uploaded to a server; analysis runs locally.</li>
            </ol>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              Note: For full AI-powered outfits and weather-aware tips, connect your API keys in settings (Gemini, OpenWeather, Unsplash) and backend routes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analyzer;
