import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../store';
import { Lock, User } from 'lucide-react';
import { COMPANY_INFO } from '../constants';

const MDLogoLarge = ({ className = "" }: { className?: string }) => (
  <div className={`font-serif font-black tracking-tighter leading-none inline-block ${className}`}>
    MD
  </div>
);

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username);
    if (success) {
      addToast('Welcome back!', 'success');
      navigate('/estimator');
    } else {
      const msg = 'Invalid credentials';
      setError(msg);
      addToast(msg, 'error');
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex w-1/2 bg-black text-white items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 to-black"></div>
        <div className="relative z-10 text-center p-12">
          <MDLogoLarge className="text-9xl mb-6 text-white" />
          <h1 className="text-5xl font-serif font-bold tracking-tight mb-4">{COMPANY_INFO.name}</h1>
          <div className="w-24 h-1 bg-white mx-auto mb-6 opacity-30"></div>
          <p className="text-gray-400 text-lg font-light tracking-[0.2em] uppercase">Interior Design Estimation System</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full bg-white p-12 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="lg:hidden text-center mb-10">
            <MDLogoLarge className="text-7xl text-black" />
          </div>
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Sign in to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-3">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-black">
                  <User size={20} className="text-gray-400 group-focus-within:text-black" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-1 focus:ring-black focus:border-black focus:bg-white transition-all outline-none font-medium placeholder:text-gray-400"
                  placeholder="Enter your username"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-3 border border-red-100 animate-slide-up">
                <Lock size={18} />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-all transform active:scale-[0.98] shadow-xl hover:shadow-2xl shadow-black/10 mt-4"
            >
              Sign In
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Demo Access Credentials</p>
            <div className="flex justify-center gap-4 text-xs">
              <span className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-gray-600">Admin: <strong className="text-black">admin</strong></span>
              <span className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-gray-600">User: <strong className="text-black">emp</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;