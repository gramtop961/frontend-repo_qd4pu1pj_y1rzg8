import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';

function HeroCover({ onStart }) {
  return (
    <section className="relative h-[80vh] min-h-[560px] w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/xzUirwcZB9SOxUWt/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Gradient overlays should not block interaction with Spline */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-6xl px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-6xl font-semibold leading-[1.05] tracking-tight">
              Discover Your Perfect Colors
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-200">
              Upload a photo or use your camera. We’ll analyze your skin tone and suggest
              palettes, outfits, and styling tips tailored to you and your weather.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button onClick={onStart} className="inline-flex items-center rounded-full bg-white text-slate-900 px-6 py-3 font-medium hover:bg-slate-100 transition shadow">
                Start Analysis
              </button>
              <span className="text-slate-300 text-sm">No photo is stored. All processing happens in your browser.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroCover;
