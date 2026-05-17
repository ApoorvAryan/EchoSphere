import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiShieldLine, RiUserLine, RiMusicFill, RiPlayFill, RiDeleteBinLine } from 'react-icons/ri';
import { getAdminStats, getAdminUsers, deleteAdminUser, getAllSongs, deleteSong } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [tab, setTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, uRes, soRes] = await Promise.all([getAdminStats(), getAdminUsers(), getAllSongs()]);
        setStats(sRes.data);
        setUsers(uRes.data);
        setSongs(soRes.data.songs || []);
      } catch { toast.error('Failed to load admin data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteAdminUser(id);
      setUsers(users.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDeleteSong = async (id) => {
    if (!confirm('Delete this song?')) return;
    try {
      await deleteSong(id);
      setSongs(songs.filter(s => s._id !== id));
      toast.success('Song deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const tabs = ['stats', 'users', 'songs'];

  return (
    <div className="px-8 py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-8">
          <RiShieldLine className="text-echo-accent text-3xl" />
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-echo-border pb-4">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl font-display font-medium capitalize transition-all ${tab === t ? 'bg-echo-accent text-white' : 'text-echo-muted hover:text-echo-text'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-echo-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'stats' && (
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: RiUserLine, label: 'Total Users', value: stats.totalUsers, color: 'from-blue-500 to-indigo-500' },
                  { icon: RiMusicFill, label: 'Total Songs', value: stats.totalSongs, color: 'from-echo-accent to-purple-500' },
                  { icon: RiPlayFill, label: 'Total Plays', value: stats.totalPlays, color: 'from-green-500 to-emerald-500' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="card">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                      <Icon className="text-white text-xl" />
                    </div>
                    <p className="font-display text-3xl font-bold">{value ?? '—'}</p>
                    <p className="text-echo-muted text-sm mt-1">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'users' && (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u._id} className="flex items-center justify-between p-4 card">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-echo-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-xs text-echo-muted">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-echo-accent/20 text-echo-accent' : 'bg-echo-border text-echo-muted'}`}>
                        {u.role}
                      </span>
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(u._id)} className="text-echo-muted hover:text-echo-danger transition-colors">
                          <RiDeleteBinLine />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'songs' && (
              <div className="space-y-2">
                {songs.map(s => (
                  <div key={s._id} className="flex items-center justify-between p-4 card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-echo-border">
                        {s.thumbnailUrl ? <img src={s.thumbnailUrl} alt={s.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🎵</div>}
                      </div>
                      <div>
                        <p className="font-medium">{s.title}</p>
                        <p className="text-xs text-echo-muted">{s.artist} · {s.plays} plays</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteSong(s._id)} className="text-echo-muted hover:text-echo-danger transition-colors">
                      <RiDeleteBinLine />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
