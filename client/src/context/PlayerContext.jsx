import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { incrementPlay } from '../services/api';
import { useAuth } from './AuthContext';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none, one, all
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => handleNext();
    const onError = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [queue, isShuffle, repeatMode]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const playSong = (song, songQueue = []) => {
    if (currentSong?._id === song._id) {
      togglePlay();
      return;
    }
    setCurrentSong(song);
    if (songQueue.length > 0) setQueue(songQueue);
    audioRef.current.src = song.audioUrl;
    audioRef.current.play();
    setIsPlaying(true);
    if (user) incrementPlay(song._id).catch(() => {});
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    if (queue.length === 0) return;
    const idx = queue.findIndex((s) => s._id === currentSong?._id);
    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = (idx + 1) % queue.length;
    }
    if (nextIdx === 0 && repeatMode === 'none' && !isShuffle) {
      setIsPlaying(false);
      return;
    }
    playSong(queue[nextIdx]);
  };

  const handlePrev = () => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (queue.length === 0) return;
    const idx = queue.findIndex((s) => s._id === currentSong?._id);
    const prevIdx = idx <= 0 ? queue.length - 1 : idx - 1;
    playSong(queue[prevIdx]);
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => {
    const modes = ['none', 'all', 'one'];
    setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]);
  };

  return (
    <PlayerContext.Provider value={{
      currentSong, queue, isPlaying, currentTime, duration,
      volume, isShuffle, repeatMode,
      playSong, togglePlay, handleNext, handlePrev, seek,
      setVolume, toggleShuffle, toggleRepeat,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
