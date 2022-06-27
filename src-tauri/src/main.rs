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
      controllers::todo_items::create_todo_item,
      controllers::todo_items::complete_todo_item,
      controllers::todo_items::uncomplete_todo_item,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
