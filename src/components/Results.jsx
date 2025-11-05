import { motion } from 'framer-motion';

function Swatch({ color }){
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg border" style={{ backgroundColor: color }} />
      <span className="text-sm text-slate-700">{color}</span>
    </div>
  );
}

function Results({ analysis }){
  if (!analysis) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">Upload a photo and run analysis to see your personalized results.</div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Detected Tone</h3>
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs" style={{ backgroundColor: analysis.previewColor, color: '#fff', borderColor: 'rgba(0,0,0,0.05)' }}>
            {analysis.temperature} · {analysis.depth}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
          <div>H: <b>{analysis.hsl.h}°</b></div>
          <div>S: <b>{analysis.hsl.s}%</b></div>
          <div>L: <b>{analysis.hsl.l}%</b></div>
          <div>RGB: <b>{analysis.avgRGB.r},{analysis.avgRGB.g},{analysis.avgRGB.b}</b></div>
        </div>
        <div className="mt-5 text-slate-700">
          <div className="text-sm">Seasonal Match</div>
          <div className="mt-1 text-xl font-semibold">{analysis.season}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium">Color Palette</h3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {analysis.palette.map((c) => (
            <Swatch key={c} color={c} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium">Outfit & Fabric Tips</h3>
        <div className="mt-3 text-sm">
          <div className="text-slate-500">Top Colors</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {analysis.outfit.colors.map((c) => (
              <span key={c} className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{c}</span>
            ))}
          </div>
          <div className="mt-4 text-slate-500">Recommended Clothing</div>
          <ul className="mt-1 list-disc list-inside text-slate-700">
            {analysis.outfit.outfits.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          <div className="mt-4 text-slate-500">Fabrics</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {analysis.outfit.fabrics.map((f) => (
              <span key={f} className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{f}</span>
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-emerald-50 p-3 text-emerald-800 text-sm">
            {analysis.outfit.message}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Results;
