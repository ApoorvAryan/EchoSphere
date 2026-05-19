import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiPlayFill, RiDeleteBinLine, RiArrowLeftLine,
  RiAddLine, RiSearchLine, RiCloseLine, RiMusicFill
} from 'react-icons/ri';
import { getPlaylist, deletePlaylist, getAllSongs, searchSongs, addToPlaylist, removeFromPlaylist } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const formatDuration = (s) => {
  if (!s) return '--:--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playSong, currentSong, isPlaying } = usePlayer();

  const [playlist, setPlaylist]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [allSongs, setAllSongs]         = useState([]);
  const [searchQ, setSearchQ]           = useState('');
  const [adding, setAdding]             = useState(null);   // songId being added
  const [removing, setRemoving]         = useState(null);   // songId being removed

  // Load playlist
  useEffect(() => {
    getPlaylist(id)
      .then(res => setPlaylist(res.data))
      .catch(() => navigate('/playlists'))
      .finally(() => setLoading(false));
  }, [id]);

  // Load all songs when add panel opens
  useEffect(() => {
    if (showAddPanel) {
      getAllSongs(1)
        .then(res => setAllSongs(res.data.songs || []))
        .catch(() => toast.error('Could not load songs'));
    }
  }, [showAddPanel]);

  // Search songs in add panel
  useEffect(() => {
    if (!showAddPanel) return;
    if (!searchQ.trim()) {
      getAllSongs(1).then(res => setAllSongs(res.data.songs || []));
      return;
    }
    const t = setTimeout(() => {
      searchSongs(searchQ).then(res => setAllSongs(res.data || []));
    }, 350);
    return () => clearTimeout(t);
  }, [searchQ, showAddPanel]);

  const handlePlayAll = () => {
    if (playlist?.songs?.length > 0) playSong(playlist.songs[0], playlist.songs);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this playlist?')) return;
    try {
      await deletePlaylist(id);
      toast.success('Playlist deleted');
      navigate('/playlists');
    } catch { toast.error('Failed to delete'); }
  };

  const handleAddSong = async (song) => {
    setAdding(song._id);
    try {
      await addToPlaylist(id, song._id);
      // Refresh playlist
      const res = await getPlaylist(id);
      setPlaylist(res.data);
      toast.success(`"${song.title}" added ✅`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add song');
    } finally {
      setAdding(null);
    }
  };

  const handleRemoveSong = async (songId, songTitle) => {
    if (!confirm(`Remove "${songTitle}" from this playlist?`)) return;
    setRemoving(songId);
    try {
      await removeFromPlaylist(id, songId);
      setPlaylist(prev => ({
        ...prev,
        songs: prev.songs.filter(s => s._id !== songId),
      }));
      toast.success('Song removed');
    } catch { toast.error('Failed to remove'); }
    finally { setRemoving(null); }
  };

  // Songs already in this playlist (for greying out in add panel)
  const inPlaylistIds = new Set((playlist?.songs || []).map(s => s._id));

  const isOwner = user?._id === playlist?.owner?._id || user?.role === 'admin';

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-echo-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!playlist) return null;

  return (
    <div className="px-8 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-echo-muted hover:text-echo-text transition-colors mb-6">
        <RiArrowLeftLine /> Back
      </button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        {/* ── Header ── */}
        <div className="flex items-end gap-6 mb-8">
          <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-echo-accent to-purple-400 flex items-center justify-center text-7xl shrink-0 shadow-2xl">
            🎵
          </div>
          <div>
            <p className="text-echo-muted text-sm mb-1">Playlist</p>
            <h1 className="font-display text-4xl font-bold mb-2">{playlist.name}</h1>
            {playlist.description && <p className="text-echo-muted mb-3">{playlist.description}</p>}
            <p className="text-echo-muted text-sm mb-4">{playlist.songs?.length || 0} song{playlist.songs?.length !== 1 ? 's' : ''}</p>

            <div className="flex items-center gap-3">
              <button onClick={handlePlayAll} disabled={!playlist.songs?.length} className="btn-primary flex items-center gap-2 disabled:opacity-40">
                <RiPlayFill /> Play All
              </button>

              {isOwner && (
                <button
                  onClick={() => setShowAddPanel(v => !v)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-display font-semibold transition-all border ${
                    showAddPanel
                      ? 'bg-echo-accent text-white border-echo-accent'
                      : 'bg-transparent border-echo-border text-echo-text hover:border-echo-accent'
                  }`}
                >
                  <RiAddLine /> {showAddPanel ? 'Done Adding' : 'Add Songs'}
                </button>
              )}

              {isOwner && (
                <button onClick={handleDelete} className="btn-ghost text-echo-danger border-echo-danger hover:bg-echo-danger/10 flex items-center gap-2">
                  <RiDeleteBinLine /> Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Add Songs Panel ── */}
        <AnimatePresence>
          {showAddPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-echo-card border border-echo-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <RiMusicFill className="text-echo-accent" />
                    Browse & Add Songs
                  </h3>
                  <button onClick={() => setShowAddPanel(false)} className="text-echo-muted hover:text-echo-text">
                    <RiCloseLine className="text-xl" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-echo-muted" />
                  <input
                    type="text"
                    placeholder="Search songs to add..."
                    className="input-field pl-10"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Song list */}
                <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                  {allSongs.length === 0 ? (
                    <p className="text-center text-echo-muted py-6">No songs found</p>
                  ) : (
                    allSongs.map(song => {
                      const alreadyIn = inPlaylistIds.has(song._id);
                      const isAdding  = adding === song._id;
                      return (
                        <div
                          key={song._id}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                            alreadyIn ? 'opacity-50' : 'hover:bg-echo-border cursor-pointer'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-echo-border">
                            {song.thumbnailUrl
                              ? <img src={song.thumbnailUrl} alt={song.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-gradient-to-br from-echo-accent to-purple-400 flex items-center justify-center text-white text-xs">♪</div>
                            }
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0" onClick={() => !alreadyIn && !isAdding && handleAddSong(song)}>
                            <p className="text-sm font-medium text-echo-text truncate">{song.title}</p>
                            <p className="text-xs text-echo-muted truncate">{song.artist}</p>
                          </div>

                          <span className="text-xs text-echo-muted shrink-0">{formatDuration(song.duration)}</span>

                          {/* Add button */}
                          <button
                            disabled={alreadyIn || isAdding}
                            onClick={() => handleAddSong(song)}
                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              alreadyIn
                                ? 'bg-echo-border text-echo-muted cursor-default'
                                : 'bg-echo-accent hover:bg-echo-accent-light text-white'
                            }`}
                            title={alreadyIn ? 'Already in playlist' : 'Add to playlist'}
                          >
                            {isAdding
                              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              : alreadyIn
                                ? <span className="text-xs">✓</span>
                                : <RiAddLine className="text-sm" />
                            }
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Songs in Playlist ── */}
        {playlist.songs?.length === 0 ? (
          <div className="text-center py-16 text-echo-muted">
            <div className="text-5xl mb-3">🎼</div>
            <p className="text-lg font-display mb-1">This playlist is empty</p>
            <p className="text-sm">Click <span className="text-echo-accent font-medium">"Add Songs"</span> above to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {playlist.songs.map((song, idx) => {
              const isActive = currentSong?._id === song._id;
              return (
                <motion.div
                  key={song._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center gap-3 p-3 rounded-xl group transition-all ${
                    isActive ? 'bg-echo-accent-glow border border-echo-accent/30' : 'hover:bg-echo-border'
                  }`}
                >
                  {/* Index / play indicator */}
                  <div className="w-6 text-center shrink-0">
                    {isActive && isPlaying
                      ? <span className="text-echo-accent text-sm">▶</span>
                      : <span className="text-echo-muted text-xs group-hover:hidden">{idx + 1}</span>
                    }
                    <button
                      onClick={() => playSong(song, playlist.songs)}
                      className="hidden group-hover:block text-echo-muted hover:text-echo-text"
                    >
                      <RiPlayFill className="text-sm" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div
                    className="w-10 h-10 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                    onClick={() => playSong(song, playlist.songs)}
                  >
                    {song.thumbnailUrl
                      ? <img src={song.thumbnailUrl} alt={song.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-echo-accent to-purple-400 flex items-center justify-center text-white text-xs">♪</div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playSong(song, playlist.songs)}>
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-echo-accent' : 'text-echo-text'}`}>{song.title}</p>
                    <p className="text-xs text-echo-muted truncate">{song.artist}</p>
                  </div>

                  <span className="text-xs text-echo-muted shrink-0">{formatDuration(song.duration)}</span>

                  {/* Remove button — visible on hover */}
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveSong(song._id, song.title)}
                      disabled={removing === song._id}
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-echo-muted hover:text-echo-danger hover:bg-echo-danger/10 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove from playlist"
                    >
                      {removing === song._id
                        ? <div className="w-3 h-3 border-2 border-echo-danger border-t-transparent rounded-full animate-spin" />
                        : <RiDeleteBinLine className="text-sm" />
                      }
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
