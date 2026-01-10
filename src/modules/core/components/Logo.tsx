import * as React from "react";
import { cn } from "../utils/cn";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 200 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-10 w-auto", className)}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#3B82F6", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#1D4ED8", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      <g transform="translate(10, 10)">
        <path d="M 20 15 L 30 5 L 40 15 L 40 35 L 20 35 Z" fill="url(#logoGradient)" />
        <rect x="27" y="25" width="6" height="10" fill="white" opacity="0.9" rx="1"/>
        <rect x="22" y="18" width="5" height="5" fill="white" opacity="0.7" rx="0.5"/>
        <circle cx="37" cy="12" r="2" fill="#10B981"/>
      </g>
      
      <text x="60" y="38" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="currentColor">
        NEZU
      </text>
      
      <text x="60" y="52" fontFamily="Arial, sans-serif" fontSize="12" fill="currentColor" opacity="0.6">
        HomePilot
      </text>
    </svg>
  );
}
