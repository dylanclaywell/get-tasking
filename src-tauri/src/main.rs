#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod controllers;
pub mod database;
pub mod models;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      controllers::todo_items::get_todo_items,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
