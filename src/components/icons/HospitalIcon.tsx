import React from 'react';

export const HospitalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9h-2.5V9.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V11H8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5H11v2.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V14h2.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" {...props} />
  </svg>
);
