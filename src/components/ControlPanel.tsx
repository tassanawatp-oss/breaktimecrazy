import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Props {
  remaining: number;
  status: string;
}

const ControlPanel: React.FC<Props> = ({ remaining, status }) => {
  const [workMins, setWorkMins] = useState<number>(25);
  const [breakMins, setBreakMins] = useState<number>(5);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    const safeWorkMins = Math.max(1, workMins);
    const safeBreakMins = Math.max(1, breakMins);
    await invoke("start_timer", { workMins: safeWorkMins, breakMins: safeBreakMins });
  };

  const handleStartBreak = async () => {
    const safeBreakMins = Math.max(1, breakMins);
    await invoke("start_break", { breakMins: safeBreakMins });
  };

  const handleStop = async () => {
    await invoke("stop_timer");
  };

  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 rounded-xl border border-slate-800 shadow-2xl">
      <div className="text-sm font-semibold text-slate-400 mb-2 tracking-widest uppercase">
        {status === "Working" ? "Working" : "BreakTimeCrazy"}
      </div>
      
      <div className="text-6xl font-black mb-8 font-mono tracking-tighter">
        {formatTime(remaining)}
      </div>

      {status === "Idle" && (
        <div className="w-full bg-slate-800/50 p-4 rounded-xl mb-6">
          <div className="mb-4">
            <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Work Duration (mins)</div>
            <div className="flex gap-2 mb-2">
              {[15, 25, 45].map(preset => (
                <button 
                  key={`work-${preset}`}
                  onClick={() => setWorkMins(preset)}
                  className={`flex-1 py-1 text-sm rounded border ${workMins === preset ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                min="1"
                value={workMins} 
                onChange={(e) => setWorkMins(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center focus:outline-none focus:border-blue-500" 
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Break Duration (mins)</div>
            <div className="flex gap-2 mb-2">
              {[5, 10, 15].map(preset => (
                <button 
                  key={`break-${preset}`}
                  onClick={() => setBreakMins(preset)}
                  className={`flex-1 py-1 text-sm rounded border ${breakMins === preset ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                min="1"
                value={breakMins} 
                onChange={(e) => setBreakMins(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center focus:outline-none focus:border-green-500" 
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 w-full">
        {status === "Idle" ? (
          <>
            <button
              onClick={handleStart}
              className="flex-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors py-3 rounded-lg font-bold shadow-lg"
            >
              Start Work
            </button>
            <button
              onClick={handleStartBreak}
              className="flex-1 bg-green-600 hover:bg-green-500 active:bg-green-700 transition-colors py-3 rounded-lg font-bold shadow-lg"
            >
              Start Break
            </button>
          </>
        ) : (
          <button
            onClick={handleStop}
            className="flex-1 bg-red-600 hover:bg-red-500 active:bg-red-700 transition-colors py-3 rounded-lg font-bold shadow-lg"
          >
            Reset
          </button>
        )}
      </div>

      <div className="mt-6 text-xs text-slate-500 italic">
        {status === "Working" ? "Next break is coming soon..." : "Ready to focus?"}
      </div>
    </div>
  );
};

export default ControlPanel;
