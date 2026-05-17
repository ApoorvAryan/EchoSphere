import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RiSearchLine, RiCloseLine } from 'react-icons/ri';
import { searchSongs } from '../services/api';
import SongCard from '../components/SongCard';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchSongs(query);
        setResults(res.data);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-6">Search</h1>

        {/* Search Input */}
        <div className="relative mb-8 max-w-xl">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-echo-muted text-xl" />
          <input
            type="text"
            placeholder="Search songs, artists, albums..."
            className="input-field pl-12 pr-12 text-lg py-4"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-echo-muted hover:text-echo-text transition-colors">
              <RiCloseLine className="text-xl" />
            </button>
          )}
        </div>

        {/* Results */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-echo-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-16 text-echo-muted">
            <div className="text-5xl mb-4">🔍</div>
            <p>No results for "{query}"</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-echo-muted mb-4">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results.map((song) => (
                <SongCard key={song._id} song={song} queue={results} />
              ))}
            </div>
          </motion.div>
        )}

        {!query && (
          <div className="text-center py-16 text-echo-muted">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-lg font-display">Start typing to discover music</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
