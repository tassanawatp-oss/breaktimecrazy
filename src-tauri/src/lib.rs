mod state;

use std::sync::Arc;
use tauri::Manager;
use state::{AppState, AppStatus, start_timer_loop};

#[tauri::command]
async fn start_timer(
    work_mins: u32,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let mut status = state.status.lock().await;
    let mut remaining = state.remaining_secs.lock().await;
    
    *status = AppStatus::Working;
    *remaining = work_mins * 60;
    
    Ok(())
}

#[tauri::command]
async fn stop_timer(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let mut status = state.status.lock().await;
    let mut remaining = state.remaining_secs.lock().await;
    
    *status = AppStatus::Idle;
    *remaining = 0;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state = Arc::new(AppState::new());

    tauri::Builder::default()
        .manage(state.clone())
        .setup(move |app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            
            let app_handle = app.handle().clone();
            let state_clone = state.clone();
            
            tauri::async_runtime::spawn(async move {
                start_timer_loop(app_handle, state_clone).await;
            });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start_timer, stop_timer])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
