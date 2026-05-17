import { useState } from 'react';
import { motion } from 'framer-motion';
import { RiPlayFill, RiPauseFill, RiHeartFill, RiHeartLine, RiMoreLine } from 'react-icons/ri';
import { usePlayer } from '../context/PlayerContext';
import { toggleFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const formatDuration = (s) => {
  if (!s) return '--:--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function SongCard({ song, queue = [], index, compact = false }) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
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

  if (compact) {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        onClick={() => playSong(song, queue)}
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
          isActive ? 'bg-echo-accent-glow border border-echo-accent border-opacity-30' : 'hover:bg-echo-border'
        }`}
      >
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
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isActive ? 'text-echo-accent' : 'text-echo-text'}`}>{song.title}</p>
          <p className="text-xs text-echo-muted truncate">{song.artist}</p>
        </div>
        <button onClick={handleLike} className="text-echo-muted hover:text-red-400 transition-colors">
          {liked ? <RiHeartFill className="text-red-400" /> : <RiHeartLine />}
        </button>
        <span className="text-xs text-echo-muted">{formatDuration(song.duration)}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => playSong(song, queue)}
      className="song-card"
    >
      <div className="relative aspect-square overflow-hidden">
        {song.thumbnailUrl ? (
          <img src={song.thumbnailUrl} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-echo-accent via-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-5xl">🎵</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
          <button onClick={handleLike} className="text-white hover:text-red-400 transition-colors">
            {liked ? <RiHeartFill className="text-red-400 text-xl" /> : <RiHeartLine className="text-xl" />}
          </button>
        </div>
        <div className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-echo-accent flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
          {isActive && isPlaying ? <RiPauseFill className="text-white text-lg" /> : <RiPlayFill className="text-white text-lg ml-0.5" />}
        </div>
        {isActive && (
          <div className="absolute top-2 left-2 bg-echo-accent text-white text-xs px-2 py-0.5 rounded-full font-display">
            Playing
          </div>
        )}
      </div>
      <div className="p-3">
        <p className={`font-display font-semibold text-sm truncate ${isActive ? 'text-echo-accent' : 'text-echo-text'}`}>{song.title}</p>
        <p className="text-echo-muted text-xs truncate mt-0.5">{song.artist}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-echo-muted">{formatDuration(song.duration)}</span>
          <span className="text-xs text-echo-muted">{song.plays} plays</span>
        </div>
      </div>
    </motion.div>
  );
}
