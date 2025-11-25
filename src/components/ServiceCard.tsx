import React from 'react';
interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  onStartNow: () => void;
}
export function ServiceCard({
  title,
  description,
  icon,
  onStartNow
}: ServiceCardProps) {
  return <div className="group glass p-8 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
      {/* Icon */}
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-3 text-cyan-400 group-hover:text-cyan-300 transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-300 leading-relaxed mb-4">{description}</p>

      {/* CTA Button */}
      <button onClick={onStartNow} className="flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors group/btn">
        <span>Start Now</span>
        <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>;
}