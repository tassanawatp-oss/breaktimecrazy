use serde::Serialize;
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::{AppHandle, Emitter};
use crate::window_manager::{show_break_screens, close_break_screens};

#[derive(Clone, Serialize, PartialEq, Debug)]
pub enum AppStatus {
    Idle,
    Working,
    OnBreak,
}

pub struct AppState {
    pub status: Arc<Mutex<AppStatus>>,
    pub remaining_secs: Arc<Mutex<u32>>,
    pub break_secs: Arc<Mutex<u32>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            status: Arc::new(Mutex::new(AppStatus::Idle)),
            remaining_secs: Arc::new(Mutex::new(0)),
            break_secs: Arc::new(Mutex::new(300)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_app_state_new() {
        let state = AppState::new();
        assert_eq!(*state.break_secs.lock().await, 300);
    }
}
pub async fn start_timer_loop(app_handle: AppHandle, state: Arc<AppState>) {
    loop {
        tokio::time::sleep(std::time::Duration::from_secs(1)).await;

        // Scope for the first batch of locks
        let (status_val, remaining_val, break_val) = {
            let mut status = state.status.lock().await;
            let mut remaining = state.remaining_secs.lock().await;

            if *status != AppStatus::Idle && *remaining > 0 {
                *remaining -= 1;
                let r = *remaining;
                let s = status.clone();

                if r == 0 {
                    if *status == AppStatus::Working {
                        let break_secs = state.break_secs.lock().await;
                        *status = AppStatus::OnBreak;
                        *remaining = *break_secs;
                        (status.clone(), *remaining, Some(true))
                    } else {
                        *status = AppStatus::Idle;
                        (status.clone(), 0, Some(false))
                    }
                } else {
                    (s, r, None)
                }
            } else {
                continue;
            }
        };

        // Emit events and handle windows outside of the lock scope
        let _ = app_handle.emit("timer-tick", remaining_val);
        println!("Timer tick: {} (Status: {:?})", remaining_val, status_val);

        if let Some(is_break_start) = break_val {
            if is_break_start {
                let _ = app_handle.emit("state-change", "OnBreak");
                show_break_screens(&app_handle);
            } else {
                let _ = app_handle.emit("state-change", "Idle");
                close_break_screens(&app_handle);
            }
        }
    }
}

