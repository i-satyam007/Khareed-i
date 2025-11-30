import React from 'react';

interface ShinyTextProps {
    text: string;
    className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({ text, className = '' }) => {
    return (
        <div className={`relative inline-block ${className}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-kh-red via-kh-purple to-kh-red bg-[length:200%_auto] animate-shine font-bold tracking-wide">
                {text}
            </span>
            <style jsx>{`
        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
        .animate-shine {
          animation: shine 2s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default ShinyText;
