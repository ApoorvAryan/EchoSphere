import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiPlayFill, RiPauseFill, RiHeartFill, RiHeartLine, RiAddLine, RiPlayListFill, RiCheckLine } from 'react-icons/ri';
import { usePlayer } from '../context/PlayerContext';
import { toggleFavorite, getPlaylists, addToPlaylist } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const formatDuration = (s) => {
  if (!s) return '--:--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

// ── Playlist picker dropdown ──────────────────────────────
function PlaylistPicker({ song, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [adding, setAdding]       = useState(null); // id of playlist being added to
  const ref = useRef(null);

  useEffect(() => {
    getPlaylists()
      .then(res => setPlaylists(res.data))
      .catch(() => toast.error('Could not load playlists'))
      .finally(() => setLoading(false));
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleAdd = async (playlistId, playlistName) => {
    setAdding(playlistId);
    try {
      await addToPlaylist(playlistId, song._id);
      toast.success(`Added to "${playlistName}" ✅`);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add';
      toast.error(msg);
    } finally {
      setAdding(null);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -6 }}
      transition={{ duration: 0.15 }}
      className="absolute z-50 right-0 top-8 w-52 bg-echo-card border border-echo-border rounded-xl shadow-2xl overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b border-echo-border">
        <p className="text-xs font-display font-semibold text-echo-muted uppercase tracking-wider">Add to Playlist</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-echo-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="px-3 py-4 text-center text-echo-muted text-xs">
          No playlists yet.<br />Create one from the Playlists page.
        </div>
      ) : (
        <ul className="max-h-52 overflow-y-auto">
          {playlists.map(pl => (
            <li key={pl._id}>
              <button
                onClick={() => handleAdd(pl._id, pl.name)}
                disabled={!!adding}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-echo-border transition-colors disabled:opacity-50"
              >
                <RiPlayListFill className="text-echo-accent shrink-0" />
                <span className="text-sm text-echo-text truncate flex-1">{pl.name}</span>
                {adding === pl._id
                  ? <div className="w-3.5 h-3.5 border-2 border-echo-accent border-t-transparent rounded-full animate-spin shrink-0" />
                  : <RiAddLine className="text-echo-muted shrink-0" />
                }
              </button>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

// ── Main SongCard ────────────────────────────────────────
export default function SongCard({ song, queue = [], compact = false }) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const { user } = useAuth();
  const [liked, setLiked]               = useState(false);
  const [showPicker, setShowPicker]     = useState(false);
  const isActive = currentSong?._id === song._id;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error('Login to favorite songs');
    try {
      const res = await toggleFavorite(song._id);
      setLiked(res.data.favorited);
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const togglePicker = (e) => {
    e.stopPropagation();
    if (!user) return toast.error('Login to add to playlist');
    setShowPicker(v => !v);
  };

  // ── COMPACT (list row) layout ──────────────────────────
  if (compact) {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        onClick={() => playSong(song, queue)}
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
          isActive ? 'bg-echo-accent-glow border border-echo-accent border-opacity-30' : 'hover:bg-echo-border'
        }`}
      >
        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-echo-card relative group">
          {song.thumbnailUrl ? (
            <img src={song.thumbnailUrl} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-echo-accent to-purple-400 flex items-center justify-center text-white text-xs">♪</div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isActive && isPlaying ? <RiPauseFill className="text-white" /> : <RiPlayFill className="text-white" />}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isActive ? 'text-echo-accent' : 'text-echo-text'}`}>{song.title}</p>
          <p className="text-xs text-echo-muted truncate">{song.artist}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {/* Add to playlist */}
          <div className="relative">
            <button
              onClick={togglePicker}
              className="text-echo-muted hover:text-echo-accent transition-colors p-1"
              title="Add to playlist"
            >
              <RiPlayListFill />
            </button>
            <AnimatePresence>
              {showPicker && (
                <PlaylistPicker song={song} onClose={() => setShowPicker(false)} />
              )}
            </AnimatePresence>
          </div>

          {/* Like */}
          <button onClick={handleLike} className="text-echo-muted hover:text-red-400 transition-colors p-1">
            {liked ? <RiHeartFill className="text-red-400" /> : <RiHeartLine />}
          </button>

          <span className="text-xs text-echo-muted w-10 text-right">{formatDuration(song.duration)}</span>
        </div>
      </motion.div>
    );
  }

  // ── CARD (grid) layout ─────────────────────────────────
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => playSong(song, queue)}
      className="song-card group"
    >
      {/* Cover */}
      <div className="relative aspect-square overflow-hidden">
        {song.thumbnailUrl ? (
          <img
            src={song.thumbnailUrl}
            alt={song.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-echo-accent via-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-5xl">🎵</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
          <button onClick={handleLike} className="text-white hover:text-red-400 transition-colors">
            {liked ? <RiHeartFill className="text-red-400 text-xl" /> : <RiHeartLine className="text-xl" />}
          </button>

          {/* Add to playlist button — bottom right of cover */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={togglePicker}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-echo-accent transition-all"
              title="Add to playlist"
            >
              <RiAddLine className="text-sm" />
            </button>
            <AnimatePresence>
              {showPicker && (
                <PlaylistPicker song={song} onClose={() => setShowPicker(false)} />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Play button */}
        <div className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-echo-accent flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
          {isActive && isPlaying
            ? <RiPauseFill className="text-white text-lg" />
            : <RiPlayFill  className="text-white text-lg ml-0.5" />}
        </div>

        {isActive && (
          <div className="absolute top-2 left-2 bg-echo-accent text-white text-xs px-2 py-0.5 rounded-full font-display">
            Playing
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className={`font-display font-semibold text-sm truncate ${isActive ? 'text-echo-accent' : 'text-echo-text'}`}>
          {song.title}
        </p>
        <p className="text-echo-muted text-xs truncate mt-0.5">{song.artist}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-echo-muted">{formatDuration(song.duration)}</span>
          <span className="text-xs text-echo-muted">{song.plays} plays</span>
        </div>
      </div>
    </motion.div>
  );
}
