import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  RiHome5Fill, RiSearchLine, RiHeartFill, RiMusicFill,
  RiUploadCloud2Line, RiUserLine, RiShieldLine, RiLogoutBoxLine
} from 'react-icons/ri';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: RiHome5Fill, label: 'Home' },
  { to: '/search', icon: RiSearchLine, label: 'Search' },
  { to: '/favorites', icon: RiHeartFill, label: 'Favorites' },
  { to: '/playlists', icon: RiMusicFill, label: 'Playlists' },
  { to: '/upload', icon: RiUploadCloud2Line, label: 'Upload' },
  { to: '/profile', icon: RiUserLine, label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-64 h-full bg-echo-surface border-r border-echo-border flex flex-col py-6 px-4 shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-echo-accent flex items-center justify-center glow">
          <span className="text-white font-display font-bold text-lg">E</span>
        </div>
        <span className="font-display font-bold text-xl text-gradient">EchoSphere</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="text-lg" />
            <span>{label}</span>
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <RiShieldLine className="text-lg" />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>

      {/* User */}
      <div className="mt-auto">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-echo-card border border-echo-border">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-echo-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-echo-text truncate">{user?.username}</p>
            <p className="text-xs text-echo-muted truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-echo-muted hover:text-echo-danger transition-colors" title="Logout">
            <RiLogoutBoxLine className="text-lg" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
