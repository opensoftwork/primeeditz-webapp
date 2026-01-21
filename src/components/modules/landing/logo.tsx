export const Logo = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 280 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        {/* Gradient for camera body */}
        <linearGradient id="cameraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="50%" stopColor="#FF4444" />
          <stop offset="100%" stopColor="#E63946" />
        </linearGradient>
        {/* Shadow filter for depth */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Video Camera Icon - Colored with Depth */}
      <g transform="translate(4, 6)" filter="url(#shadow)">
        {/* Camera body with gradient and depth */}
        <rect x="0" y="10" width="36" height="24" rx="2" fill="url(#cameraGradient)" />
        <rect x="0" y="10" width="36" height="8" rx="2" fill="rgba(255,255,255,0.2)" />
        <rect x="0" y="26" width="36" height="8" rx="0" fill="rgba(0,0,0,0.2)" />
        
        {/* Main lens with depth */}
        <circle cx="18" cy="22" r="8" fill="rgba(0,0,0,0.3)" />
        <circle cx="18" cy="22" r="7.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <circle cx="18" cy="22" r="6" fill="rgba(0,0,0,0.5)" />
        <circle cx="18" cy="22" r="5" fill="url(#cameraGradient)" />
        <circle cx="18" cy="21" r="4" fill="rgba(0,0,0,0.3)" />
        
        {/* Viewfinder box on top with depth */}
        <rect x="4" y="4" width="12" height="8" rx="1" fill="url(#cameraGradient)" />
        <rect x="4" y="4" width="12" height="4" rx="1" fill="rgba(255,255,255,0.2)" />
        
        {/* Recording indicator dot - bright red */}
        <circle cx="30" cy="16" r="3.5" fill="#FF0000" />
        <circle cx="30" cy="16" r="2.5" fill="#FF4444" />
        <circle cx="30" cy="15.5" r="1.5" fill="rgba(255,255,255,0.6)" />
        
        {/* Video tape reel indicator with depth */}
        <circle cx="6" cy="22" r="2.5" fill="rgba(0,0,0,0.4)" />
        <circle cx="6" cy="22" r="2" fill="rgba(255,255,255,0.3)" />
        <circle cx="6" cy="22" r="1" fill="rgba(0,0,0,0.5)" />
        
        {/* Additional depth elements - side highlight */}
        <rect x="0" y="10" width="2" height="24" rx="1" fill="rgba(255,255,255,0.3)" />
        <rect x="34" y="10" width="2" height="24" rx="0" fill="rgba(0,0,0,0.3)" />
      </g>
      
      {/* PRIME Text - White */}
      <text
        x="48"
        y="28"
        fill="white"
        fontSize="20"
        fontFamily="sans-serif"
        fontWeight="700"
        letterSpacing="0.5px"
      >
        PRIME
      </text>
      
      {/* EDITZ Text - White */}
      <text
        x="48"
        y="48"
        fill="white"
        fontSize="20"
        fontFamily="sans-serif"
        fontWeight="700"
        letterSpacing="0.5px"
      >
        EDITZ
      </text>
    </svg>
  );
};
