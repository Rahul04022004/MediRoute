

import React from 'react';

interface SortIconProps {
  direction: 'asc' | 'desc';
  className?: string;
}

export const SortIcon: React.FC<SortIconProps> = ({ direction, className = 'h-4 w-4' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    {direction === 'asc' ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    )}
  </svg>
);
