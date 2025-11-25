import React from 'react';
import { StarIcon } from 'lucide-react';
interface TestimonialCardProps {
  name: string;
  position: string;
  content: string;
  rating: number;
}
export function TestimonialCard({
  name,
  position,
  content,
  rating
}: TestimonialCardProps) {
  return <div className="glass p-8 rounded-xl">
      {/* Rating */}
      <div className="flex space-x-1 mb-4">
        {[...Array(rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
      </div>

      {/* Content */}
      <p className="text-gray-300 mb-6 leading-relaxed italic">"{content}"</p>

      {/* Author */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-white">{name}</div>
          <div className="text-sm text-gray-400">{position}</div>
        </div>
      </div>
    </div>;
}