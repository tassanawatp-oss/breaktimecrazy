mod state;
mod window_manager;

use std::sync::Arc;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use state::{AppState, AppStatus, start_timer_loop};
use tauri::Emitter;
use window_manager::{toggle_main_window, close_break_screens};

#[tauri::command]
async fn start_timer(
    work_mins: u32,
    break_mins: u32,
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let mut status = state.status.lock().await;
    let mut remaining = state.remaining_secs.lock().await;
    let mut break_secs = state.break_secs.lock().await;
    
    *status = AppStatus::Working;
    *remaining = work_mins * 60;
    *break_secs = break_mins * 60;

    let _ = app_handle.emit("state-change", "Working");
    let _ = app_handle.emit("timer-tick", *remaining);
    
    Ok(())
}

#[tauri::command]
async fn start_break(
    break_mins: u32,
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let mut status = state.status.lock().await;
    let mut remaining = state.remaining_secs.lock().await;
    let mut break_secs = state.break_secs.lock().await;
    
    *status = AppStatus::OnBreak;
    *break_secs = break_mins * 60;
    *remaining = *break_secs;

    let _ = app_handle.emit("state-change", "OnBreak");
    let _ = app_handle.emit("timer-tick", *remaining);
    window_manager::show_break_screens(&app_handle);
    
    Ok(())
}

#[tauri::command]
async fn stop_timer(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let mut status = state.status.lock().await;
    let mut remaining = state.remaining_secs.lock().await;
    
    *status = AppStatus::Idle;
    *remaining = 0;

    let _ = app_handle.emit("state-change", "Idle");
    let _ = app_handle.emit("timer-tick", 0);
    close_break_screens(&app_handle);
    
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

            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>).unwrap();
            let menu = Menu::with_items(app, &[&quit_i]).unwrap();

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        let app = tray.app_handle();
                        toggle_main_window(app);
                    }
                })
                .build(app)
                .unwrap();
            
            let app_handle = app.handle().clone();
            let state_clone = state.clone();
            
            tauri::async_runtime::spawn(async move {
                start_timer_loop(app_handle, state_clone).await;
            });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start_timer, stop_timer, start_break])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
