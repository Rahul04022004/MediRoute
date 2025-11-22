import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export const AmbulanceDispatchLogo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClass = sizeMap[size];
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 120" 
      className={`${sizeClass} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Background circle (removed) */}
      
      {/* Ambulance body */}
      <rect x="20" y="40" width="140" height="60" rx="8" ry="8" fill="none" stroke="currentColor" strokeWidth="2.5"/>
      
      {/* Ambulance cabin */}
      <rect x="20" y="40" width="35" height="35" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="2.5"/>
      
      {/* Ambulance door line */}
      <line x1="40" y1="40" x2="40" y2="100" stroke="currentColor" strokeWidth="2"/>
      
      {/* Medical cross - front of ambulance */}
      <g transform="translate(130, 55)">
        <rect x="-12" y="-12" width="24" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
        <line x1="-6" y1="0" x2="6" y2="0" stroke="currentColor" strokeWidth="2.5"/>
        <line x1="0" y1="-6" x2="0" y2="6" stroke="currentColor" strokeWidth="2.5"/>
      </g>
      
      {/* Window (cabin) */}
      <circle cx="32" cy="52" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      
      {/* Front wheel */}
      <circle cx="40" cy="100" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="40" cy="100" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      
      {/* Back wheel */}
      <circle cx="130" cy="100" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="130" cy="100" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      
      {/* Headlight */}
      <rect x="20" y="58" width="3" height="8" rx="1.5" fill="currentColor"/>
      
      {/* Speed lines (indicating movement/urgency) */}
      <line x1="10" y1="52" x2="15" y2="52" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <line x1="8" y1="62" x2="15" y2="62" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <line x1="10" y1="72" x2="15" y2="72" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      
      {/* Stripes on side (ambulance marking) */}
      <line x1="65" y1="40" x2="65" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeDasharray="8,4"/>
    </svg>
  );
};
