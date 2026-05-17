import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { RiUserLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-echo-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass rounded-3xl p-8 relative z-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-echo-accent flex items-center justify-center glow">
            <span className="text-white font-display font-bold text-xl">E</span>
          </div>
          <span className="font-display font-bold text-2xl text-gradient">EchoSphere</span>
        </div>

        <h1 className="font-display text-3xl font-bold text-echo-text mb-1">Create account</h1>
        <p className="text-echo-muted mb-8">Start your musical journey today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <RiUserLine className="absolute left-4 top-1/2 -translate-y-1/2 text-echo-muted" />
            <input type="text" placeholder="Username" className="input-field pl-11"
              value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} />
          </div>
          <div className="relative">
            <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-echo-muted" />
            <input type="email" placeholder="Email address" className="input-field pl-11"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="relative">
            <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-echo-muted" />
            <input type={showPass ? 'text' : 'password'} placeholder="Password (min 6 chars)" className="input-field pl-11 pr-11"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-echo-muted hover:text-echo-text transition-colors">
              {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-echo-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-echo-accent hover:text-echo-accent-light transition-colors font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
