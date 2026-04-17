import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function RegistrationModal({ isOpen, onClose, onRegisterSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      // Success — show confirmation message
      setSuccess(true);
      setLoading(false);
      
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Call callback to notify parent
      if (onRegisterSuccess) {
        setTimeout(() => onRegisterSuccess(), 2000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F5F5F7]/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-[400px] bg-white rounded-[32px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white flex flex-col items-center animate-in fade-in zoom-in duration-300">
        
        <div className="w-20 h-20 bg-gradient-to-b from-green-400 to-green-600 rounded-[22px] flex items-center justify-center text-white text-4xl mb-6 shadow-lg">
          ✨
        </div>

        <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2">Create Account</h2>
        <p className="text-[#86868b] text-[14px] mb-8 text-center">
          Sign up to start storing your files in the cloud.
        </p>

        {success ? (
          <div className="w-full text-center">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-green-600 font-semibold mb-2">Account Created!</p>
            <p className="text-xs text-[#86868b] mb-6">
              Check your email to confirm your account, then you can sign in.
            </p>
            <button 
              onClick={onClose}
              className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium py-3 rounded-full transition-all"
            >
              Got it
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="w-full space-y-3">
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
              placeholder="Password (min 6 characters)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              required
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              required
            />

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-full transition-all active:scale-95 shadow-md disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <button 
          onClick={onClose}
          className="mt-6 text-[13px] text-blue-600 hover:text-blue-700 font-medium"
        >
          Back
        </button>
      </div>
    </div>
  );
}
