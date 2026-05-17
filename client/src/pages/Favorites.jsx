import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiHeartFill } from 'react-icons/ri';
import { getFavorites } from '../services/api';
import SongCard from '../components/SongCard';

export default function Favorites() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites().then(res => setSongs(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <RiHeartFill className="text-red-400 text-3xl" />
          <h1 className="font-display text-3xl font-bold">Favorites</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-echo-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-20 text-echo-muted">
            <div className="text-6xl mb-4">💔</div>
            <p className="text-xl font-display mb-2">No favorites yet</p>
            <p>Like songs to see them here</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {songs.filter(Boolean).map((song) => (
              <SongCard key={song._id} song={song} queue={songs} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
