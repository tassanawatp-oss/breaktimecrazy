# Customizable Timers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the BreakTimeCrazy application to allow users to specify custom work and break durations via a hybrid (preset + custom input) interface in the Control Panel.

**Architecture:** The Rust backend's `start_timer` command and state machine will be updated to accept and store both `work_mins` and `break_mins`. The React frontend will manage the local state for these durations and provide a UI with preset buttons and custom input fields.

**Tech Stack:** Tauri (v2), Rust, React, TypeScript, TailwindCSS.

---

### Task 1: Update Rust Backend to Support Custom Break Duration

**Files:**
- Modify: `src-tauri/src/state.rs`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Update AppState to store break duration**

In `src-tauri/src/state.rs`:
```rust
// ... existing imports ...

pub struct AppState {
    pub status: Arc<Mutex<AppStatus>>,
    pub remaining_secs: Arc<Mutex<u32>>,
    pub break_secs: Arc<Mutex<u32>>, // Add this
}

impl AppState {
    pub fn new() -> Self {
        Self {
            status: Arc::new(Mutex::new(AppStatus::Idle)),
            remaining_secs: Arc::new(Mutex::new(0)),
            break_secs: Arc::new(Mutex::new(300)), // Default 5 mins
        }
    }
}
```

- [ ] **Step 2: Update Timer Loop to use custom break duration**

In `src-tauri/src/state.rs`, modify `start_timer_loop`:
```rust
pub async fn start_timer_loop(app_handle: AppHandle, state: Arc<AppState>) {
    loop {
        tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        let mut status = state.status.lock().await;
        let mut remaining = state.remaining_secs.lock().await;
        let break_secs = state.break_secs.lock().await; // Lock break_secs

        if *status != AppStatus::Idle && *remaining > 0 {
            *remaining -= 1;
            let _ = app_handle.emit("timer-tick", *remaining);

            if *remaining == 0 {
                if *status == AppStatus::Working {
                    *status = AppStatus::OnBreak;
                    *remaining = *break_secs; // Use custom break duration
                    let _ = app_handle.emit("state-change", "OnBreak");
                    show_break_screens(&app_handle);
                } else {
                    *status = AppStatus::Idle;
                    let _ = app_handle.emit("state-change", "Idle");
                    close_break_screens(&app_handle);
                }
            }
        }
    }
}
```

- [ ] **Step 3: Update `start_timer` command to accept break duration**

In `src-tauri/src/lib.rs`:
```rust
// ... existing imports ...

#[tauri::command]
async fn start_timer(
    work_mins: u32,
    break_mins: u32, // Add this parameter
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let mut status = state.status.lock().await;
    let mut remaining = state.remaining_secs.lock().await;
    let mut break_secs = state.break_secs.lock().await; // Lock break_secs
    
    *status = AppStatus::Working;
    *remaining = work_mins * 60;
    *break_secs = break_mins * 60; // Store break duration
    
    Ok(())
}
```

- [ ] **Step 4: Verify compilation**

Run: `cd src-tauri && cargo check`
Expected: Passes without errors.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/state.rs src-tauri/src/lib.rs
git commit -m "feat: update rust backend to support custom break duration"
```

---

### Task 2: Implement Hybrid Timer Control UI in React

**Files:**
- Modify: `src/components/ControlPanel.tsx`

- [ ] **Step 1: Import useState and add state variables**

In `src/components/ControlPanel.tsx`:
```typescript
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

// ... existing Props interface ...

const ControlPanel: React.FC<Props> = ({ remaining, status }) => {
  const [workMins, setWorkMins] = useState<number>(25);
  const [breakMins, setBreakMins] = useState<number>(5);

// ...
```

- [ ] **Step 2: Update handleStart to pass both durations**

In `src/components/ControlPanel.tsx`:
```typescript
  const handleStart = async () => {
    // Ensure values are at least 1 minute to prevent immediate completion
    const safeWorkMins = Math.max(1, workMins);
    const safeBreakMins = Math.max(1, breakMins);
    await invoke("start_timer", { workMins: safeWorkMins, breakMins: safeBreakMins });
  };
```

- [ ] **Step 3: Add Timer Control UI (when Idle)**

Replace the empty space in the ControlPanel with the hybrid UI:
```typescript
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
```
*Note: Make sure to place this block above the Start/Reset buttons.*

- [ ] **Step 4: Commit**

```bash
git add src/components/ControlPanel.tsx
git commit -m "feat: implement hybrid timer control ui for work and break durations"
```
