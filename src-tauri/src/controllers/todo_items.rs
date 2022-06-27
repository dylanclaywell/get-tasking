use crate::models::todo_item;
use uuid::Uuid;

#[tauri::command]
pub fn get_todo_items(date_completed: String) -> String {
  return serde_json::to_string(&todo_item::get_all(date_completed)).unwrap();
}
