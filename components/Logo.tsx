import React from "react";
import Image from "next/image";

export default function Logo({ className = "w-10 h-10", showText = false }: { className?: string, showText?: boolean }) {
  // Default size fallback if className doesn't imply one, but 'fill' handles most cases
  return (
    <div className={`flex items-center gap-2 ${showText ? "gap-3" : ""}`}>
      {/* Logo Icon */}
      <div className={`relative ${className}`}>
        <Image 
          src="/Logo.svg" 
          alt="Khareed-i Logo" 
          fill 
          className="object-contain"
          priority // Load immediately since it's above the fold
        />
      </div>

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