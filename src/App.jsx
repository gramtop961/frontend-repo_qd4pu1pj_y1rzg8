import { useRef, useState } from 'react';
import HeroCover from './components/HeroCover';
import Analyzer from './components/Analyzer';
import Results from './components/Results';
import TrendingLooks from './components/TrendingLooks';

function App() {
  const analyzeRef = useRef(null);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyzeDone = (result) => {
    setAnalysis(result);
    // Smooth scroll to results
    setTimeout(() => {
      const el = document.getElementById('results-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleStart = () => {
    if (analyzeRef.current) analyzeRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReset = () => {
    setAnalysis(null);
    if (analyzeRef.current) analyzeRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <HeroCover onStart={handleStart} />

      <section ref={analyzeRef} className="relative py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Step 1 · Upload or Use Camera</h2>
              <p className="text-slate-600 mt-2">We’ll analyze your face photo to detect skin tone and suggest a color palette.</p>
            </div>
          </div>
          <Analyzer onDone={handleAnalyzeDone} />
        </div>
      </section>

      <section id="results-section" className="relative py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Step 2 · AI Analysis Results</h2>
              <p className="text-slate-600 mt-2">Detected tone, seasonal match, palette, and quick outfit guidance.</p>
            </div>
            {analysis && (
              <button onClick={handleReset} className="inline-flex items-center rounded-full bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 transition">
                Try another photo
              </button>
            )}
          </div>

          <Results analysis={analysis} />
        </div>
      </section>

      <section className="relative py-16 sm:py-24 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Explore Trending Looks</h2>
            <p className="text-slate-600 mt-2">Updated using your detected palette keywords when available.</p>
          </div>
          <TrendingLooks keywordHint={analysis?.season || 'modern fashion colors'} />
        </div>
      </section>

      <footer className="py-10 border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} ColorSense · Find your perfect palette</p>
          <div className="text-xs text-slate-500">Made with care · Tailwind + Framer Motion + Spline</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
