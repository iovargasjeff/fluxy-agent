// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
    fs,
    net::{TcpListener, TcpStream},
    path::{Path, PathBuf},
    process::Command,
    sync::{
        atomic::{AtomicBool, Ordering},
        Mutex,
    },
    thread,
    time::{Duration, Instant},
};
#[cfg(not(debug_assertions))]
use tauri::path::BaseDirectory;
use tauri::{Manager, RunEvent, State};
use tauri_plugin_shell::{process::CommandChild, ShellExt};

struct SidecarState {
    port: u16,
    child: Mutex<Option<CommandChild>>,
    ready: AtomicBool,
}

#[tauri::command]
fn get_sidecar_port(state: State<'_, SidecarState>) -> u16 {
    state.port
}

#[tauri::command]
fn is_backend_ready(state: State<'_, SidecarState>) -> bool {
    state.ready.load(Ordering::Relaxed)
}

fn get_available_port() -> u16 {
    loop {
        let listener = TcpListener::bind("127.0.0.1:0").expect("failed to reserve local port");
        let port = listener.local_addr().expect("failed to read local port").port();
        if ![3000, 4200, 5000, 5432, 8000, 8080, 3306, 27017].contains(&port) {
            return port;
        }
    }
}

fn migrate_legacy_database(target: &Path) {
    if target.exists() {
        return;
    }

    let mut candidates = Vec::<PathBuf>::new();
    if let Ok(current_dir) = std::env::current_dir() {
        candidates.push(current_dir.join("cdcart_data.db"));
        candidates.push(current_dir.join("src-tauri").join("cdcart_data.db"));
        candidates.push(current_dir.join("backend-python").join("cdcart_data.db"));
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            candidates.push(parent.join("cdcart_data.db"));
        }
    }

    if let Some(source) = candidates.into_iter().find(|path| path.is_file()) {
        let _ = fs::copy(source, target);
    }
}

fn wait_for_backend(app: tauri::AppHandle, port: u16) {
    thread::spawn(move || {
        let deadline = Instant::now() + Duration::from_secs(20);
        while Instant::now() < deadline {
            if TcpStream::connect_timeout(
                &format!("127.0.0.1:{port}").parse().expect("invalid backend address"),
                Duration::from_millis(300),
            )
            .is_ok()
            {
                let state = app.state::<SidecarState>();
                state.ready.store(true, Ordering::Relaxed);
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
                return;
            }
            thread::sleep(Duration::from_millis(200));
        }

        if let Some(window) = app.get_webview_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
        }
    });
}

fn terminate_sidecar(child: CommandChild) {
    #[cfg(windows)]
    {
        let _ = Command::new("taskkill")
            .args(["/PID", &child.pid().to_string(), "/T", "/F"])
            .output();

        #[cfg(not(debug_assertions))]
        let _ = Command::new("taskkill")
            .args(["/IM", "fluxy-sidecar.exe", "/T", "/F"])
            .output();
    }
    let _ = child.kill();
}

fn stop_managed_sidecar(app: &tauri::AppHandle) {
    let state = app.state::<SidecarState>();
    let child = state.child.lock().expect("sidecar state poisoned").take();
    if let Some(child) = child {
        terminate_sidecar(child);
    }
}

fn main() {
    let port = get_available_port();

    let app = tauri::Builder::default()
        .manage(SidecarState {
            port,
            child: Mutex::new(None),
            ready: AtomicBool::new(false),
        })
        .invoke_handler(tauri::generate_handler![get_sidecar_port, is_backend_ready])
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .on_window_event(|window, event| {
            if window.label() == "main" && matches!(event, tauri::WindowEvent::CloseRequested { .. }) {
                stop_managed_sidecar(window.app_handle());
                std::process::exit(0);
            }
        })
        .setup(move |app| {
            let data_dir = app.path().app_data_dir()?;
            let exports_dir = data_dir.join("exports");
            fs::create_dir_all(&exports_dir)?;

            let database_path = data_dir.join("fluxy_data.db");
            let secrets_key_path = data_dir.join("secrets.key");
            migrate_legacy_database(&database_path);

            #[cfg(debug_assertions)]
            let mcp_bridge_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .parent()
                .and_then(Path::parent)
                .and_then(Path::parent)
                .and_then(Path::parent)
                .expect("invalid workspace layout")
                .join("scripts")
                .join("fluxy-mcp-stdio.mjs");

            #[cfg(not(debug_assertions))]
            let mcp_bridge_path = app
                .path()
                .resolve("fluxy-mcp-stdio.mjs", BaseDirectory::Resource)?;

            #[cfg(debug_assertions)]
            let command = {
                let backend_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                    .parent()
                    .and_then(Path::parent)
                    .expect("invalid workspace layout")
                    .join("backend-python");
                app.shell()
                    .command("python")
                    .arg("main.py")
                    .current_dir(backend_dir)
            };

            #[cfg(not(debug_assertions))]
            let command = app.shell().sidecar("fluxy-sidecar")?;

            let command = command
                .arg("--port")
                .arg(port.to_string())
                .env("DATABASE_PATH", database_path)
                .env("TEMP_DIR", exports_dir)
                .env("APP_CONFIG_DIR", data_dir)
                .env("SECRETS_KEY_PATH", secrets_key_path)
                .env("FLUXY_MCP_BRIDGE_PATH", mcp_bridge_path);

            let (mut events, child) = command.spawn()?;
            app.state::<SidecarState>()
                .child
                .lock()
                .expect("sidecar state poisoned")
                .replace(child);

            thread::spawn(move || {
                while let Some(event) = events.blocking_recv() {
                    match event {
                        tauri_plugin_shell::process::CommandEvent::Stderr(bytes) => {
                            log::error!("backend: {}", String::from_utf8_lossy(&bytes));
                        }
                        tauri_plugin_shell::process::CommandEvent::Error(error) => {
                            log::error!("backend process error: {error}");
                        }
                        _ => {}
                    }
                }
            });

            wait_for_backend(app.handle().clone(), port);
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building Fluxy Desktop");

    app.run(|app_handle, event| {
        if matches!(event, RunEvent::Exit | RunEvent::ExitRequested { .. }) {
            stop_managed_sidecar(app_handle);
        }
    });
}
