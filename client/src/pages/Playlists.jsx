import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiPlayListFill, RiAddLine } from 'react-icons/ri';
import { getPlaylists, createPlaylist } from '../services/api';
import toast from 'react-hot-toast';

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getPlaylists().then(res => setPlaylists(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await createPlaylist({ name });
      setPlaylists([res.data, ...playlists]);
      setName('');
      setShowCreate(false);
      toast.success('Playlist created!');
    } catch {
      toast.error('Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <RiPlayListFill className="text-echo-accent text-3xl" />
            <h1 className="font-display text-3xl font-bold">Playlists</h1>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2">
            <RiAddLine /> New Playlist
          </button>
        </div>

        {showCreate && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleCreate}
            className="mb-8 flex gap-3"
          >
            <input
              type="text"
              placeholder="Playlist name..."
              className="input-field flex-1 max-w-xs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? '...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button>
          </motion.form>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-echo-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-20 text-echo-muted">
            <div className="text-6xl mb-4">🎼</div>
            <p className="text-xl font-display mb-2">No playlists yet</p>
            <p>Create your first playlist above</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {playlists.map((p) => (
              <Link key={p._id} to={`/playlists/${p._id}`}>
                <motion.div whileHover={{ y: -4 }} className="song-card p-4 flex flex-col gap-3">
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-echo-accent to-purple-400 flex items-center justify-center text-4xl">
                    🎵
                  </div>
                  <div>
                    <p className="font-display font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-echo-muted">{p.songs?.length || 0} songs</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
