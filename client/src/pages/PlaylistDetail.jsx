import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiPlayFill, RiDeleteBinLine, RiArrowLeftLine } from 'react-icons/ri';
import { getPlaylist, deletePlaylist } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import SongCard from '../components/SongCard';
import toast from 'react-hot-toast';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playSong } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlaylist(id).then(res => setPlaylist(res.data)).catch(() => navigate('/playlists')).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this playlist?')) return;
    try {
      await deletePlaylist(id);
      toast.success('Playlist deleted');
      navigate('/playlists');
    } catch { toast.error('Failed to delete'); }
  };

  const handlePlayAll = () => {
    if (playlist?.songs?.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-echo-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!playlist) return null;

  return (
    <div className="px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-echo-muted hover:text-echo-text transition-colors mb-6">
        <RiArrowLeftLine /> Back
      </button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-end gap-6 mb-8">
          <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-echo-accent to-purple-400 flex items-center justify-center text-7xl shrink-0 shadow-2xl">
            🎵
          </div>
          <div>
            <p className="text-echo-muted text-sm mb-1">Playlist</p>
            <h1 className="font-display text-4xl font-bold mb-2">{playlist.name}</h1>
            {playlist.description && <p className="text-echo-muted mb-3">{playlist.description}</p>}
            <p className="text-echo-muted text-sm">{playlist.songs?.length || 0} songs</p>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={handlePlayAll} className="btn-primary flex items-center gap-2">
                <RiPlayFill /> Play All
              </button>
              {(user?._id === playlist.owner?._id || user?.role === 'admin') && (
                <button onClick={handleDelete} className="btn-ghost text-echo-danger border-echo-danger hover:bg-echo-danger/10 flex items-center gap-2">
                  <RiDeleteBinLine /> Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {playlist.songs?.length === 0 ? (
          <div className="text-center py-12 text-echo-muted">
            <p>No songs in this playlist yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {playlist.songs.map((song) => (
              <SongCard key={song._id} song={song} queue={playlist.songs} compact />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
