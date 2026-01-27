import React, { useState } from 'react';
import { UserType } from '../types';
import { ShieldCheck, UserCircle2, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Get admin password from environment variable
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  const handleLogin = (role: UserType, enteredPassword?: string) => {
    if (role === 'Admin') {
      // Check password for Admin
      if (enteredPassword === ADMIN_PASSWORD) {
        onLogin(role);
        setError('');
        setPassword('');
        setSelectedRole(null);
      } else {
        setError('Invalid password for Admin account');
      }
    } else if (role === 'Attachee') {
      // No password required for Attachee
      onLogin(role);
      setSelectedRole(null);
      setPassword('');
      setError('');
    }
  };

  const handleRoleSelect = (role: UserType) => {
    if (role === 'Admin') {
      setSelectedRole(role);
      setPassword('');
      setError('');
    } else if (role === 'Attachee') {
      // Direct login for Attachee without password
      handleLogin('Attachee');
    }
  };

  const handleCancel = () => {
    setSelectedRole(null);
    setPassword('');
    setError('');
  };

  const getRoleDisplayName = (role: UserType) => {
    switch (role) {
      case 'Admin': return 'Administrator';
      case 'Attachee': return 'Attachee/Technician';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-[#006097] p-4 rounded-2xl shadow-lg shadow-blue-200">
            <ShieldCheck size={48} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Equipment Tracker</h1>
        <p className="text-gray-500 mb-10 font-medium">COBICT REPAIR Management System</p>
        
        {selectedRole === 'Admin' ? (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Login as Administrator
              </h2>
              <p className="text-gray-500 text-sm mt-1">Enter admin password to continue</p>
            </div>
            
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && password.trim()) {
                      handleLogin('Admin', password);
                    }
                  }}
                  placeholder="Enter admin password"
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                Default password: admin123 (Change in .env.local)
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 px-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => handleLogin('Admin', password)}
                disabled={!password.trim()}
                className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all ${
                  password.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Login as Admin
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={() => handleRoleSelect('Admin')}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-200">
                  <UserCircle2 className="text-gray-600 group-hover:text-blue-700" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-semibold text-gray-700 group-hover:text-blue-900 block">Administrator</span>
                  <span className="text-sm text-gray-400 group-hover:text-blue-400">Password required • Full access</span>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-blue-500"></div>
            </button>

            <button 
              onClick={() => handleRoleSelect('Attachee')}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-green-200">
                  <UserCircle2 className="text-gray-600 group-hover:text-green-700" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-semibold text-gray-700 group-hover:text-green-900 block">Attachee/Technician</span>
                  <span className="text-sm text-gray-400 group-hover:text-green-400">Quick login • Limited access</span>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-green-500"></div>
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            Secure Workshop Entry Authorized • Version 1.0
          </p>
          <p className="text-xs text-gray-300 mt-1">
            All logins are monitored and recorded
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;