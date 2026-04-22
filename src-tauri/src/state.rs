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
        let mut status = state.status.lock().await;
        let mut remaining = state.remaining_secs.lock().await;

        if *status != AppStatus::Idle && *remaining > 0 {
            *remaining -= 1;
            let _ = app_handle.emit("timer-tick", *remaining);

            if *remaining == 0 {
                if *status == AppStatus::Working {
                    *status = AppStatus::OnBreak;
                    *remaining = *state.break_secs.lock().await;
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
