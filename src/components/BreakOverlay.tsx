import React from "react";

interface Props {
  remaining: number;
}

const BreakOverlay: React.FC<Props> = ({ remaining }) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen w-screen bg-black/90 backdrop-blur-xl text-white flex flex-col items-center justify-center animate-in fade-in duration-1000">
      <div className="text-xl font-bold text-blue-400 mb-4 tracking-[0.5em] uppercase">
        Take a Break
      </div>
      
      <div className="text-[12rem] font-black leading-none mb-12 tracking-tighter opacity-90 drop-shadow-2xl">
        {formatTime(remaining)}
      </div>

      <div className="text-2xl font-medium text-slate-300 max-w-xl text-center px-8">
        Stand up, stretch your body, and look away from the screen for a moment.
      </div>

      <div className="mt-20 text-sm text-slate-500 font-mono tracking-widest uppercase opacity-50">
        Strict mode active • Relax your eyes
      </div>
    </div>
  );
};

export default BreakOverlay;
