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
    <div 
      data-tauri-drag-region
      className="h-screen w-screen bg-slate-950 text-white flex flex-col p-5 pt-7 font-sans overflow-y-auto selection:bg-blue-500/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20">
            BT
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">BreakTimeCrazy</div>
            <div className="text-[10px] text-slate-500 font-medium">
              {status === "Working" ? "Focusing..." : status === "OnBreak" ? "Resting..." : "Ready to focus?"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${status === "Working" ? "bg-blue-500 animate-pulse" : status === "OnBreak" ? "bg-green-500 animate-pulse" : "bg-slate-700"}`} />
          <button 
            onClick={() => invoke("quit_app")}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-800 transition-colors text-slate-500 hover:text-red-400"
            title="Quit Application"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Timer Display Card */}
      <div className="text-center mb-4 py-4 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-xl shadow-black/40">
        <div className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-0.5">
          Time Remaining
        </div>
        <div className="text-5xl font-extrabold tracking-tighter tabular-nums text-white drop-shadow-sm">
          {formatTime(remaining)}
        </div>
      </div>

      {status === "Idle" && (
        <div className="flex flex-col gap-4 mb-4">
          {/* Work Duration Section */}
          <section>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Duration</label>
              <span className="text-[10px] font-semibold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">{workMins} min</span>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mb-1.5 shadow-inner">
              {[15, 25, 45].map(preset => (
                <button 
                  key={`work-${preset}`}
                  onClick={() => setWorkMins(preset)}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${workMins === preset ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input 
              type="number" 
              min="1"
              value={workMins} 
              onChange={(e) => setWorkMins(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 text-sm text-center font-mono focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-700" 
              placeholder="Custom Work Mins"
            />
          </section>

          {/* Break Duration Section */}
          <section>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Break Duration</label>
              <span className="text-[10px] font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">{breakMins} min</span>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mb-1.5 shadow-inner">
              {[5, 10, 15].map(preset => (
                <button 
                  key={`break-${preset}`}
                  onClick={() => setBreakMins(preset)}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${breakMins === preset ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input 
              type="number" 
              min="1"
              value={breakMins} 
              onChange={(e) => setBreakMins(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 text-sm text-center font-mono focus:outline-none focus:border-green-500/50 transition-colors placeholder:text-slate-700" 
              placeholder="Custom Break Mins"
            />
          </section>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-auto mb-2">
        {status === "Idle" ? (
          <>
            <button
              onClick={handleStart}
              className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-[0.98] transition-all py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 border-t border-blue-400/20"
            >
              Start Work
            </button>
            <button
              onClick={handleStartBreak}
              className="flex-1 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all py-3 rounded-2xl font-semibold text-sm border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              Break
            </button>
          </>
        ) : (
          <button
            onClick={handleStop}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-[0.98] transition-all py-3 rounded-2xl font-bold text-sm shadow-lg shadow-red-500/20 border-t border-red-400/20"
          >
            Reset Session
          </button>
        )}
      </div>
    </div>

  );
};

export default ControlPanel;
