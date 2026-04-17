import { useState } from 'react';
import { supabase } from '../supabaseClient';
import RegistrationModal from './RegistrationModal';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      onClose(); // Close modal on success
      window.location.reload(); // Refresh to update Dashboard session
    }
  };

  const handleRegistrationSuccess = () => {
    // Close registration modal and show sign-in prompt
    setShowRegistration(false);
    setError(null);
    setEmail('');
    setPassword('');
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F5F5F7]/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-[400px] bg-white rounded-[32px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white flex flex-col items-center animate-in fade-in zoom-in duration-300">
          
          <div className="w-20 h-20 bg-gradient-to-b from-blue-400 to-blue-600 rounded-[22px] flex items-center justify-center text-white text-4xl mb-6 shadow-lg">
            ☁️
          </div>

          <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2">Sign in to Cloud</h2>
          <p className="text-[#86868b] text-[14px] mb-8 text-center">
            Use your credentials to access your drive.
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-3">
            {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}
            
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              required
            />

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium py-3 rounded-full transition-all active:scale-95 shadow-md disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-200 pt-6 w-full">
            <p className="text-xs text-[#86868b] mb-3">Don't have an account?</p>
            <button 
              onClick={() => setShowRegistration(true)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-[#1D1D1F] font-medium py-2.5 rounded-full transition-all text-sm"
            >
              Create Account
            </button>
          </div>

          <button 
            onClick={onClose}
            className="mt-4 text-[13px] text-blue-600 hover:text-blue-700 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={showRegistration} 
        onClose={() => setShowRegistration(false)}
        onRegisterSuccess={handleRegistrationSuccess}
      />
    </>
  );
}