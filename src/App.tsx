import { useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { listen } from "@tauri-apps/api/event";
import ControlPanel from "./components/ControlPanel";
import BreakOverlay from "./components/BreakOverlay";

function App() {
  const [label, setLabel] = useState<string>("");
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState<string>("Idle");

  useEffect(() => {
    const window = getCurrentWebviewWindow();
    setLabel(window.label);

    const unlistenTick = listen<number>("timer-tick", (event) => {
      setRemaining(event.payload);
    });

    const unlistenState = listen<string>("state-change", (event) => {
      setStatus(event.payload);
    });

    return () => {
      unlistenTick.then((f) => f());
      unlistenState.then((f) => f());
    };
  }, []);

  if (label.startsWith("break_screen")) {
    return <BreakOverlay remaining={remaining} />;
  }

  return (
    <ControlPanel 
      remaining={remaining} 
      status={status} 
    />
  );
}

export default App;
