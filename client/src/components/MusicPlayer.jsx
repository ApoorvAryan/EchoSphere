import { usePlayer } from '../context/PlayerContext';
import {
  RiPlayFill, RiPauseFill, RiSkipForwardFill, RiSkipBackFill,
  RiShuffleLine, RiRepeatLine, RiRepeatOneFill, RiVolumeUpLine, RiVolumeMuteLine
} from 'react-icons/ri';
import { motion } from 'framer-motion';

const formatTime = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function MusicPlayer() {
  const {
    currentSong, isPlaying, currentTime, duration, volume,
    isShuffle, repeatMode, togglePlay, handleNext, handlePrev,
    seek, setVolume, toggleShuffle, toggleRepeat,
  } = usePlayer();

  if (!currentSong) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-echo-border"
    >
      <div className="flex items-center gap-4 px-6 py-4 max-w-full">
        {/* Song Info */}
        <div className="flex items-center gap-3 w-56 shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-echo-card">
            {currentSong.thumbnailUrl ? (
              <img src={currentSong.thumbnailUrl} alt={currentSong.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-echo-accent to-purple-400 flex items-center justify-center text-white font-bold">
                ♪
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-echo-text truncate">{currentSong.title}</p>
            <p className="text-xs text-echo-muted truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${isShuffle ? 'text-echo-accent' : 'text-echo-muted hover:text-echo-text'}`}
            >
              <RiShuffleLine className="text-lg" />
            </button>
            <button onClick={handlePrev} className="text-echo-muted hover:text-echo-text transition-colors">
              <RiSkipBackFill className="text-2xl" />
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-echo-accent hover:bg-echo-accent-light flex items-center justify-center text-white shadow-lg shadow-echo-accent-glow transition-all active:scale-95"
            >
              {isPlaying ? <RiPauseFill className="text-xl" /> : <RiPlayFill className="text-xl ml-0.5" />}
            </button>
            <button onClick={handleNext} className="text-echo-muted hover:text-echo-text transition-colors">
              <RiSkipForwardFill className="text-2xl" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`transition-colors ${repeatMode !== 'none' ? 'text-echo-accent' : 'text-echo-muted hover:text-echo-text'}`}
            >
              {repeatMode === 'one' ? <RiRepeatOneFill className="text-lg" /> : <RiRepeatLine className="text-lg" />}
            </button>
          </div>

          {/* Seek bar */}
          <div className="flex items-center gap-3 w-full max-w-lg">
            <span className="text-xs text-echo-muted w-10 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #7C3AED ${progress}%, #1E1E2E ${progress}%)`
                }}
              />
            </div>
            <span className="text-xs text-echo-muted w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-36 shrink-0">
          <button
            onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            className="text-echo-muted hover:text-echo-text transition-colors"
          >
            {volume === 0 ? <RiVolumeMuteLine className="text-lg" /> : <RiVolumeUpLine className="text-lg" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7C3AED ${volume * 100}%, #1E1E2E ${volume * 100}%)`
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
