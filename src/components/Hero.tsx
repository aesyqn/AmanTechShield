import React from 'react';
import { ShieldCheckIcon, ArrowRightIcon } from 'lucide-react';
interface HeroProps {
  onStartScanning: () => void;
}
export function Hero({
  onStartScanning
}: HeroProps) {
  return <div className="relative min-h-screen flex items-center justify-center overflow-hidden cyber-grid">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        {/* Shield icon with glow */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <ShieldCheckIcon className="w-24 h-24 text-cyan-400 glow-blue" />
            <div className="absolute inset-0 animate-ping opacity-20">
              <ShieldCheckIcon className="w-24 h-24 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Comprehensive{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            Cybersecurity
          </span>{' '}
          Strategies
          <br />
          for Growth and Resilience
        </h1>

        {/* Subheading */}
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Safeguard your business with AI-powered security audits and
          vulnerability assessments. Our platform combines cutting-edge
          technology with Islamic ethical principles to protect what matters
          most.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button onClick={onStartScanning} className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all flex items-center space-x-2">
            <span>Start Scanning</span>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 border-2 border-cyan-500/50 rounded-lg font-semibold text-lg hover:bg-cyan-500/10 transition-all">
            View Demo
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 pt-12 border-t border-cyan-500/20">
          <p className="text-sm text-gray-400 mb-6 uppercase tracking-wider">
            Trusted by Leading Financial Institutions
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['Bank Amanah', 'Islamic Finance', 'Shariah Bank', 'Takaful Insurance', 'Halal Investment', 'Barakah Holdings'].map(company => <div key={company} className="text-gray-400 font-mono text-sm">
                {company}
              </div>)}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="glass p-6 rounded-xl">
            <div className="text-4xl font-bold text-cyan-400 mb-2">10+</div>
            <div className="text-gray-300">Years of Experience</div>
          </div>
          <div className="glass p-6 rounded-xl">
            <div className="text-4xl font-bold text-cyan-400 mb-2">900+</div>
            <div className="text-gray-300">Security Audits Completed</div>
          </div>
          <div className="glass p-6 rounded-xl">
            <div className="text-4xl font-bold text-cyan-400 mb-2">99%</div>
            <div className="text-gray-300">Client Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </div>;
}