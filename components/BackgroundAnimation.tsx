import React from 'react';

export const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none bg-slate-50">
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-slate-300/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" style={{ animationDelay: '4s' }}></div>

      {/* Modern Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.3]"
        style={{
            backgroundImage: `radial-gradient(#94a3b8 1.5px, transparent 1.5px)`,
            backgroundSize: '40px 40px'
        }}
      ></div>
      
      {/* Subtle Noise Texture (Paper feel) */}
      <div className="absolute inset-0 opacity-[0.03] bg-repeat" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
};