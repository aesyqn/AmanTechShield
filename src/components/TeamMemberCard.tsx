import React from 'react';
import { MailIcon } from 'lucide-react';
interface TeamMemberCardProps {
  name: string;
  role: string;
  email: string;
  image: string;
}
export function TeamMemberCard({
  name,
  role,
  email,
  image
}: TeamMemberCardProps) {
  return <div className="glass p-6 rounded-xl text-center group hover:border-cyan-500/50 transition-all duration-300">
      {/* Profile Image */}
      <div className="relative mb-4 mx-auto w-32 h-32">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <img src={image} alt={name} className="w-full h-full rounded-full border-4 border-cyan-500/30 group-hover:border-cyan-500 transition-all duration-300 object-cover" />
      </div>

      {/* Name */}
      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
        {name}
      </h3>

      {/* Role */}
      <p className="text-sm text-cyan-400 mb-3 font-medium">{role}</p>

      {/* Email */}
      <a href={`mailto:${email}`} className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors">
        <MailIcon className="w-4 h-4" />
        <span>{email}</span>
      </a>
    </div>;
}