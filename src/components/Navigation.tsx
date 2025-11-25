import React, { useState } from 'react';
import { ShieldIcon, MenuIcon, XIcon } from 'lucide-react';
interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  isAuthenticated: boolean;
  onLogout: () => void;
}
export function Navigation({
  onNavigate,
  currentPage,
  isAuthenticated,
  onLogout
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [{
    label: 'Home',
    page: 'home'
  }, {
    label: 'About Us',
    page: 'about'
  }];
  return <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center space-x-2 hover:opacity-80">
            <ShieldIcon className="w-8 h-8 text-cyan-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              AmanTech Shield
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => <button key={item.page} onClick={() => onNavigate(item.page)} className={`text-sm font-medium transition-colors ${currentPage === item.page ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-400'}`}>
                {item.label}
              </button>)}

            {isAuthenticated ? <>
                <button onClick={() => onNavigate('scanning')} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                  Start Scanning
                </button>
                <button onClick={onLogout} className="px-6 py-2 border border-cyan-500/50 rounded-lg font-medium hover:bg-cyan-500/10 transition-all">
                  Logout
                </button>
              </> : <>
                <button onClick={() => onNavigate('login')} className="px-6 py-2 border border-cyan-500/50 rounded-lg font-medium hover:bg-cyan-500/10 transition-all">
                  Login
                </button>
                <button onClick={() => onNavigate('register')} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                  Register
                </button>
              </>}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-cyan-500/10">
            {mobileMenuOpen ? <XIcon className="w-6 h-6 text-cyan-400" /> : <MenuIcon className="w-6 h-6 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && <div className="md:hidden glass border-t border-cyan-500/20">
          <div className="px-4 py-4 space-y-3">
            {navItems.map(item => <button key={item.page} onClick={() => {
          onNavigate(item.page);
          setMobileMenuOpen(false);
        }} className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${currentPage === item.page ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-300 hover:bg-cyan-500/10'}`}>
                {item.label}
              </button>)}

            {isAuthenticated ? <>
                <button onClick={() => {
            onNavigate('scanning');
            setMobileMenuOpen(false);
          }} className="block w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium text-center">
                  Start Scanning
                </button>
                <button onClick={() => {
            onLogout();
            setMobileMenuOpen(false);
          }} className="block w-full px-4 py-2 border border-cyan-500/50 rounded-lg font-medium text-center">
                  Logout
                </button>
              </> : <>
                <button onClick={() => {
            onNavigate('login');
            setMobileMenuOpen(false);
          }} className="block w-full px-4 py-2 border border-cyan-500/50 rounded-lg font-medium text-center">
                  Login
                </button>
                <button onClick={() => {
            onNavigate('register');
            setMobileMenuOpen(false);
          }} className="block w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium text-center">
                  Register
                </button>
              </>}
          </div>
        </div>}
    </nav>;
}