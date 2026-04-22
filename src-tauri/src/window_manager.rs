use tauri::{AppHandle, Manager, WebviewWindowBuilder, WebviewUrl};

pub fn toggle_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            window.hide().unwrap();
        } else {
            window.show().unwrap();
            window.set_focus().unwrap();
        }
    }
}

pub fn show_break_screens(app: &AppHandle) {
    let monitors = app.available_monitors().unwrap();
    for (i, monitor) in monitors.iter().enumerate() {
        let label = format!("break_screen_{}", i);
        if app.get_webview_window(&label).is_none() {
            let pos = monitor.position();
            let size = monitor.size();

            let window = WebviewWindowBuilder::new(app, label, WebviewUrl::App("index.html".into())) // Pointing to main index but will use route or conditional render
                .title("Break Time")
                .fullscreen(true)
                .always_on_top(true)
                .decorations(false)
                .closable(false)
                .position(pos.x as f64, pos.y as f64)
                .inner_size(size.width as f64, size.height as f64)
                .build()
                .unwrap();
            
            let _ = window.set_shadow(false);
            // In v2, transparency might need to be set via the window handle
            // But we'll trust the decorators(false) and React styling for now
            // Or try window.set_transparent(true) if it's available
        }
    }
}

pub fn close_break_screens(app: &AppHandle) {
    let monitors = app.available_monitors().unwrap();
    for (i, _) in monitors.iter().enumerate() {
        let label = format!("break_screen_{}", i);
        if let Some(window) = app.get_webview_window(&label) {
            window.close().unwrap();
        }
    }
}
