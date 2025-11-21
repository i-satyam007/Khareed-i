import React from "react";

export default function Logo({ className = "w-10 h-10", showText = false }: { className?: string, showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${showText ? "gap-3" : ""}`}>
      {/* Logo Icon: Price Tag with 'K' */}
      <svg
        className={className}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF5350" /> {/* kh-red */}
            <stop offset="100%" stopColor="#B9A7D3" /> {/* kh-purple */}
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.15" />
          </filter>
        </defs>
        
        {/* Price Tag Shape */}
        <path
          d="M 10,50 L 50,10 L 90,10 C 95.5,10 100,14.5 100,20 L 100,80 C 100,85.5 95.5,90 90,90 L 50,90 Z"
          fill="url(#brandGradient)"
          filter="url(#shadow)"
        />
        
        {/* The 'K' Text */}
        <text
          x="62"
          y="68"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize="50"
          fill="white"
          textAnchor="middle"
        >
          K
        </text>
        
        {/* Tag Hole */}
        <circle cx="62" cy="25" r="6" fill="white" opacity="0.9" />
      </svg>

      {/* Text Branding (Optional) */}
      {showText && (
        <div className="hidden sm:block">
          <div className="font-bold text-lg text-kh-dark leading-tight">Khareed-i</div>
          <div className="text-[10px] text-kh-gray uppercase tracking-wide">IPM Marketplace</div>
        </div>
      )}
    </div>
  );
}