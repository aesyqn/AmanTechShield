import React, { useState } from 'react';
import { ShieldIcon, UserIcon, MailIcon, LockIcon, BriefcaseIcon, AlertCircleIcon } from 'lucide-react';
interface RegisterPageProps {
  onRegister: (name: string, email: string, password: string, position: string) => boolean;
  onNavigateToLogin: () => void;
}
export function RegisterPage({
  onRegister,
  onNavigateToLogin
}: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword || !position) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const success = onRegister(name, email, password, position);
      setIsLoading(false);
      if (!success) {
        setError('Registration failed. Please try again.');
      }
    }, 1000);
  };
  return <div className="min-h-screen w-full flex items-center justify-center px-4 py-20 cyber-grid">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 glow-blue">
            <ShieldIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-400">
            Join AmanTech Shield to secure your systems
          </p>
        </div>

        {/* Register Form */}
        <div className="glass p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
                <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-white" placeholder="Aisyah Binti Rahman" />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-white" placeholder="auditor@example.com" />
              </div>
            </div>

            {/* Position Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Position
              </label>
              <div className="relative">
                <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={position} onChange={e => setPosition(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-white" placeholder="Lead Auditor" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-white" placeholder="••••••••" />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-white" placeholder="••••••••" />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <input type="checkbox" required className="w-4 h-4 mt-1 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500" />
              <span className="text-sm text-gray-400">
                I agree to the{' '}
                <button type="button" className="text-cyan-400 hover:text-cyan-300">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-cyan-400 hover:text-cyan-300">
                  Privacy Policy
                </button>
              </span>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span> : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button onClick={onNavigateToLogin} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Sign in here
              </button>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔒 Your data is encrypted and secure</p>
        </div>
      </div>
    </div>;
}