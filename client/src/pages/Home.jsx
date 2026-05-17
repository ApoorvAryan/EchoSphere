import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllSongs, getTrending } from '../services/api';
import SongCard from '../components/SongCard';
import { useAuth } from '../context/AuthContext';
import { RiFireFill, RiMusicFill, RiTimeFill } from 'react-icons/ri';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, trendRes] = await Promise.all([getAllSongs(), getTrending()]);
        setSongs(allRes.data.songs || []);
        setTrending(trendRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="px-8 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="relative rounded-3xl overflow-hidden bg-gradient-mesh p-8 border border-echo-border">
          <div className="absolute inset-0 bg-gradient-to-r from-echo-accent/20 to-transparent pointer-events-none" />
          <p className="text-echo-muted font-body mb-1">{greeting},</p>
          <h1 className="font-display text-4xl font-bold text-gradient mb-2">{user?.username} 👋</h1>
          <p className="text-echo-muted text-lg">What do you want to listen to today?</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-echo-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Trending */}
          {trending.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <RiFireFill className="text-orange-400 text-xl" />
                <h2 className="font-display text-xl font-bold">Trending Now</h2>
              </div>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              >
                {trending.slice(0, 5).map((song) => (
                  <motion.div key={song._id} variants={item}>
                    <SongCard song={song} queue={trending} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {/* All Songs */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <RiMusicFill className="text-echo-accent text-xl" />
              <h2 className="font-display text-xl font-bold">All Songs</h2>
            </div>
            {songs.length === 0 ? (
              <div className="text-center py-16 text-echo-muted">
                <div className="text-6xl mb-4">🎵</div>
                <p className="text-lg font-display">No songs yet. Upload the first one!</p>
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              >
                {songs.map((song) => (
                  <motion.div key={song._id} variants={item}>
                    <SongCard song={song} queue={songs} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
