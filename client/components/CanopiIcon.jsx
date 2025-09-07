import React from 'react';

const CanopiIcon = () => {
  return (
    <div className="canopi-icon">
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="15" stroke="url(#gradient)" strokeWidth="2" fill="none"/>
        <path 
          d="M8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24" 
          stroke="url(#gradient)" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="4" fill="url(#gradient)"/>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#1d4ed8"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default CanopiIcon;
