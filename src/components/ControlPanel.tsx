import { invoke } from "@tauri-apps/api/core";

interface Props {
  remaining: number;
  status: string;
}

const ControlPanel: React.FC<Props> = ({ remaining, status }) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    await invoke("start_timer", { workMins: 25 });
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

      <div className="flex gap-4 w-full">
        {status === "Idle" ? (
          <button
            onClick={handleStart}
            className="flex-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors py-3 rounded-lg font-bold shadow-lg"
          >
            Start Work
          </button>
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
