import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MusicPlayer from './MusicPlayer';
import { usePlayer } from '../context/PlayerContext';

export default function Layout() {
  const { currentSong } = usePlayer();
  return (
    <div className="flex h-screen bg-echo-bg overflow-hidden">
      <Sidebar />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${currentSong ? 'pb-28' : 'pb-4'}`}>
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
      {currentSong && <MusicPlayer />}
    </div>
  );
}
