

import React from 'react';

export const SteeringWheelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-9 0a9 9 0 1118 0 9 9 0 01-18 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-3 0a3 3 0 116 0 3 3 0 01-6 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-4m0-10V3M4.929 4.929l2.122 2.121m10.606 10.607-2.121-2.122M4.929 19.071l2.121-2.12M19.071 4.929l-2.121 2.121" />
  </svg>
);
