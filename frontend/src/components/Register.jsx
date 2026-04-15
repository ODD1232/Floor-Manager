import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', employeeId: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5009/api/auth/register', formData);
      alert('✅ Admin account created! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input-field shadow-lg"
          placeholder="John Doe"
        />
      </div>

      {/* Employee ID */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Employee ID</label>
        <input
          type="text"
          required
          value={formData.employeeId}
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          className="input-field shadow-lg"
          placeholder="EMP001"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Password (min 6 chars)</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="input-field pr-12 shadow-lg"
            placeholder="Secure password"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showPassword ? (
                // Eye Slash - COMPLETE PATH
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M9.75 9.75a2.25 2.25 0 013 3m5.106 4.106a2.25 2.25 0 11-3.182-3.182m0 0L9.75 9.75m3.182 3.182L15 15M9.75 9.75L3 3" />
                </>
              ) : (
                // Eye Open - COMPLETE PATH
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 text-red-800 p-4 rounded-2xl backdrop-blur-sm">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary text-lg font-bold shadow-2xl">
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Account...
          </>
        ) : (
          'Create Admin Account'
        )}
      </button>
    </form>
  );
};

export default Register;