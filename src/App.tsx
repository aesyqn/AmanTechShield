import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ScanningFlow } from './pages/ScanningFlow';
import { useAuth } from './hooks/useAuth';
export function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'login' | 'register' | 'scanning'>('home');
  const {
    user,
    isAuthenticated,
    login,
    register,
    logout
  } = useAuth();
  const handleNavigate = (page: string) => {
    if (page === 'about') {
      setCurrentPage('home');
      setTimeout(() => {
        document.getElementById('about')?.scrollIntoView({
          behavior: 'smooth'
        });
      }, 100);
    } else {
      setCurrentPage(page as any);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  const handleStartScanning = () => {
    if (isAuthenticated) {
      setCurrentPage('scanning');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      setCurrentPage('login');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  const handleLogin = (email: string, password: string) => {
    const success = login(email, password);
    if (success) {
      setCurrentPage('scanning');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    return success;
  };
  const handleRegister = (name: string, email: string, password: string, position: string) => {
    const success = register(name, email, password, position);
    if (success) {
      setCurrentPage('scanning');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    return success;
  };
  const handleLogout = () => {
    logout();
    setCurrentPage('home');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const handleScanningComplete = () => {
    setCurrentPage('home');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return <div className="min-h-screen w-full bg-[#0A0E27]">
      <Navigation onNavigate={handleNavigate} currentPage={currentPage} isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      {currentPage === 'home' && <LandingPage onStartScanning={handleStartScanning} />}

      {currentPage === 'login' && <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setCurrentPage('register')} />}

      {currentPage === 'register' && <RegisterPage onRegister={handleRegister} onNavigateToLogin={() => setCurrentPage('login')} />}

      {currentPage === 'scanning' && isAuthenticated && <ScanningFlow user={user} onComplete={handleScanningComplete} />}
    </div>;
}