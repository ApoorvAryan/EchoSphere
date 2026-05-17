import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('echo_user');
    const token = localStorage.getItem('echo_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // Refresh profile
      getProfile().then(res => {
        setUser(res.data);
        localStorage.setItem('echo_user', JSON.stringify(res.data));
      }).catch(() => {
        logout();
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem('echo_token', token);
    localStorage.setItem('echo_user', JSON.stringify(userData));
    setUser(userData);
    toast.success(`Welcome back, ${userData.username}! 🎵`);
    return userData;
  };

  const register = async (username, email, password) => {
    const res = await registerUser({ username, email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem('echo_token', token);
    localStorage.setItem('echo_user', JSON.stringify(userData));
    setUser(userData);
    toast.success(`Welcome to EchoSphere, ${userData.username}! 🎵`);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('echo_token');
    localStorage.removeItem('echo_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
