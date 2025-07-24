use tauri::Emitter;
#[cfg(target_os = "windows")]
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, RunEvent,
};
#[cfg(target_os = "windows")]
use tauri_plugin_positioner::{Position, WindowExt};

#[cfg(any(target_os = "android", target_os = "ios"))]
fn run_mobile() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .run(tauri::generate_context!());
}

#[cfg(target_os = "windows")]
fn run_desktop() {
    #[cfg(target_os = "windows")]
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
          println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
          // when defining deep link schemes at runtime, you must also check `argv` here
        }))
        .plugin(tauri_plugin_oauth::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            #[cfg(target_os = "windows")]
            let _ = app.handle().plugin(tauri_plugin_positioner::init());

            // Create menu items for tray
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let expand_i = MenuItem::with_id(app, "expand", "Expand", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&expand_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_tray_icon_event(|tray, event| {
                    #[cfg(target_os = "windows")]
                    tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);

                    match event {
                        TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } => {
                            let app = tray.app_handle();

                            let popup_window = app.get_webview_window("main").unwrap();

                            if popup_window.is_visible().unwrap() {
                                popup_window.hide().unwrap();
                            } else {
                                let _ = popup_window.set_size(tauri::Size::Logical(
                                    tauri::LogicalSize {
                                        width: 400.0,
                                        height: 600.0,
                                    },
                                ));
                                let _ = popup_window.move_window(Position::TrayCenter);
                                let _ = popup_window.set_skip_taskbar(true);
                                popup_window.show().unwrap();
                                popup_window.set_focus().unwrap();

                                // Emit an event to notify that the app is in tray mode
                                let _ = app.emit("app-window-state", "tray");
                            }
                        }
                        _ => {}
                    }
                })
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        println!("quit menu item was clicked");
                        app.exit(0);
                    }
                    "expand" => {
                        let popup_window = app.get_webview_window("main").unwrap();
                        let _ = popup_window.set_size(tauri::Size::Logical(tauri::LogicalSize {
                            width: 800.0,
                            height: 600.0,
                        }));
                        let _ = popup_window.move_window(Position::Center);
                        let _ = popup_window.set_skip_taskbar(false);
                        popup_window.show().unwrap();
                        popup_window.set_focus().unwrap();

                        // Emit an event to notify that the app is in tray mode
                        let _ = app.emit("app-window-state", "not-tray");
                    }
                    _ => {
                        println!("menu item {:?} not handled", event.id);
                    }
                })
                .build(app)?;
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("Tauri app failed")
        .run(|_app_handle, event| match event {
            RunEvent::ExitRequested { api, code, .. } => {
                // Keep the event loop running even if all windows are closed
                // This allow us to catch tray icon events when there is no window
                // if we manually requested an exit (code is Some(_)) we will let it go through
                if code.is_none() {
                    api.prevent_exit();
                }
            }
            RunEvent::WindowEvent {
                event: tauri::WindowEvent::CloseRequested { api, .. },
                ..
            } => {
                api.prevent_close();
                _app_handle
                    .get_webview_window("main")
                    .unwrap()
                    .hide()
                    .unwrap();
            }
            _ => {}
        });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(any(target_os = "android", target_os = "ios"))]
    {
        // Code specific to Android and iOS
        run_mobile();
    }

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        // Code specific to desktop (Windows, macOS, Linux)
        run_desktop();
    }
}
