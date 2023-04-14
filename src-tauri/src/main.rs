#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use window_shadows::set_shadow;

mod controllers;
pub mod database;
pub mod models;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            set_shadow(&main_window, true).expect("Unsupported platform!");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            controllers::todo_items::get_todo_items,
            controllers::todo_items::create_todo_item,
            controllers::todo_items::complete_todo_item,
            controllers::todo_items::uncomplete_todo_item,
            controllers::todo_items::update_todo_item,
            controllers::todo_items::delete_todo_item,
            controllers::tags::get_tags,
            controllers::tags::create_tag,
            controllers::tags::update_tag,
            controllers::tags::delete_tag,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
