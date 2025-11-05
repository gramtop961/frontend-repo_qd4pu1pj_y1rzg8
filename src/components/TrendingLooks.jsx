import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function TrendingLooks({ keywordHint = 'fashion colors' }){
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true); setError('');
      try {
        const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || import.meta.env.UNSPLASH_ACCESS_KEY;
        if (!key) {
          // Graceful fallback with curated placeholders
          setItems([
            'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1503342217505-b0a15cf70489?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1200&auto=format&fit=crop',
          ]);
          setLoading(false);
          return;
        }
        const q = encodeURIComponent(`${keywordHint} outfit`);
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${q}&per_page=12&orientation=portrait`, {
          headers: { Authorization: `Client-ID ${key}` }
        });
        const data = await res.json();
        if (data?.results) {
          setItems(data.results.map(r => r.urls?.small || r.urls?.regular).filter(Boolean));
        } else {
          setError('No trends found right now.');
        }
      } catch (e) {
        setError('Could not load trending looks.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [keywordHint]);

  return (
    <div>
      {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((src, i) => (
          <motion.div key={src + i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="relative aspect-[3/4] overflow-hidden rounded-xl">
            <img src={src} alt="trend" className="h-full w-full object-cover" />
          </motion.div>
        ))}
      </div>
      {loading && (
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="h-full w-1/3 bg-gradient-to-r from-slate-400 to-slate-600" />
        </div>
      )}
    </div>
  );
}

export default TrendingLooks;
