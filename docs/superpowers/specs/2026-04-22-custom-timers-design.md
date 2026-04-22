# BreakTimeCrazy - Customizable Timers Design

## 1. Overview
Update the existing BreakTimeCrazy application to allow users to specify both Work and Break durations using a hybrid interface (Presets + Custom Input) in the Control Panel.

## 2. Updated Requirements
*   **Custom Work Timer:** Users can choose from presets (15, 25, 45 mins) or input a custom minute value.
*   **Custom Break Timer:** Users can choose from presets (5, 10, 15 mins) or input a custom minute value.
*   **State Persistence:** (Optional but recommended) The UI should remember the last used settings within the session.
*   **Rust IPC Update:** Update the `start_timer` command to accept both `work_mins` and `break_mins`.

## 3. Architecture Changes

### 3.1 Backend (Rust)
*   **AppState Update:** Store both current work duration and break duration if needed for session persistence.
*   **Command Update:**
    *   `start_timer(work_mins: u32, break_mins: u32)`: Now accepts two parameters.
*   **Timer Loop:** When `remaining` hits 0 and transitioning to `OnBreak`, use the user-defined `break_mins` instead of the hardcoded 300 seconds (5 mins).

### 3.2 Frontend (React)
*   **State Management:**
    *   `workDuration`: number (default 25)
    *   `breakDuration`: number (default 5)
*   **Control Panel Component:**
    *   Add two sections: "Work Time" and "Break Time".
    *   Each section contains:
        *   Row of Preset Buttons.
        *   Inline Custom Input field.
    *   Update the "Start Work" button to call `invoke("start_timer", { workMins, breakMins })`.

## 4. Design UI (Compact Grid style)
```
[ WORK TIME ]
[ 15 ] [ 25 ] [ 45 ]
Custom: [ 25 ] mins

[ BREAK TIME ]
[ 5  ] [ 10 ] [ 15 ]
Custom: [ 5  ] mins

[ START WORK ]
```

## 5. Development Plan
1.  **Rust Command:** Update `start_timer` in `src-tauri/src/lib.rs` and `src-tauri/src/state.rs` to handle both durations.
2.  **React State:** Add state hooks for `workMins` and `breakMins` in `App.tsx` or `ControlPanel.tsx`.
3.  **UI Implementation:** Build the Preset buttons and Input fields in `ControlPanel.tsx`.
4.  **IPC Wiring:** Pass the new parameters from React to Rust.
5.  **Verification:** Test that both durations are correctly applied.
