import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiUserLine, RiEditLine, RiTimeLine } from 'react-icons/ri';
import { getProfile, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SongCard from '../components/SongCard';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then(res => { setProfile(res.data); setUsername(res.data.username); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile({ username });
      setProfile(res.data);
      setUser({ ...user, username: res.data.username });
      localStorage.setItem('echo_user', JSON.stringify({ ...user, username: res.data.username }));
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const recentSongs = profile?.recentlyPlayed?.map(r => r.song).filter(Boolean) || [];

  return (
    <div className="px-8 py-8">
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-echo-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Profile Card */}
          <div className="glass rounded-3xl p-8 mb-8 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-echo-accent to-purple-400 flex items-center justify-center text-white font-bold text-4xl shrink-0 glow">
              {profile?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="flex items-center gap-3">
                  <input type="text" className="input-field max-w-xs" value={username} onChange={(e) => setUsername(e.target.value)} />
                  <button onClick={handleSave} disabled={saving} className="btn-primary py-2">Save</button>
                  <button onClick={() => setEditing(false)} className="btn-ghost py-2">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-3xl font-bold">{profile?.username}</h1>
                  <button onClick={() => setEditing(true)} className="text-echo-muted hover:text-echo-accent transition-colors">
                    <RiEditLine />
                  </button>
                </div>
              )}
              <p className="text-echo-muted mt-1">{profile?.email}</p>
              {profile?.role === 'admin' && (
                <span className="mt-2 inline-block text-xs bg-echo-accent/20 text-echo-accent border border-echo-accent/30 px-3 py-1 rounded-full">Admin</span>
              )}
            </div>
          </div>

          {/* Recently Played */}
          {recentSongs.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <RiTimeLine className="text-echo-accent text-xl" />
                <h2 className="font-display text-xl font-bold">Recently Played</h2>
              </div>
              <div className="space-y-1">
                {recentSongs.slice(0, 10).map((song) => (
                  <SongCard key={song._id} song={song} queue={recentSongs} compact />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
