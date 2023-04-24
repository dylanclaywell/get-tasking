use crate::models::todo_item;
use tauri::AppHandle;
use uuid::Uuid;

#[tauri::command]
pub fn get_todo_items(app_handle: AppHandle, date_completed: String) -> String {
    let todo_items = todo_item::get_all(&app_handle, date_completed).unwrap();

    return serde_json::to_string(&todo_items).unwrap();
}

#[tauri::command]
pub fn create_todo_item(
    app_handle: AppHandle,
    title: String,
    date_created: String,
    time_created: String,
    timezone_created: String,
) -> String {
    let id = Uuid::new_v4().to_string();
    let todo_item = todo_item::create(
        &app_handle,
        id,
        title,
        date_created,
        time_created,
        timezone_created,
    )
    .unwrap();
    return serde_json::to_string(&todo_item).unwrap();
}

#[tauri::command]
pub fn complete_todo_item(
    app_handle: AppHandle,
    id: String,
    date_completed: String,
    time_completed: String,
    timezone_completed: String,
) {
    if todo_item::complete(
        &app_handle,
        id,
        date_completed,
        time_completed,
        timezone_completed,
    )
    .is_err()
    {
        println!("Failed to complete todo item");
    }
}

#[tauri::command]
pub fn uncomplete_todo_item(app_handle: AppHandle, id: String) {
    if todo_item::uncomplete(&app_handle, id).is_err() {
        println!("Failed to uncomplete todo item");
    }
}

#[tauri::command]
pub fn update_todo_item(
    app_handle: AppHandle,
    id: String,
    title: Option<String>,
    description: Option<String>,
    notes: Option<String>,
) {
    if todo_item::update(&app_handle, id, title, description, notes).is_err() {
        println!("Failed to update todo item");
    }
}

#[tauri::command]
pub fn delete_todo_item(app_handle: AppHandle, id: String) {
    if todo_item::delete(&app_handle, id).is_err() {
        println!("Failed to delete todo item");
    }
}

#[tauri::command]
pub fn add_tag_to_todo_item(app_handle: AppHandle, todo_item_id: String, tag_id: String) {
    if todo_item::add_tag(&app_handle, todo_item_id, tag_id).is_err() {
        println!("Failed to add tag to todo item");
    }
}

#[tauri::command]
pub fn remove_tag_from_todo_item(app_handle: AppHandle, todo_item_id: String, tag_id: String) {
    if todo_item::remove_tag(&app_handle, todo_item_id, tag_id).is_err() {
        println!("Failed to remove tag from todo item");
    }
}

#[tauri::command]
pub fn get_todo_item_tags(app_handle: AppHandle, todo_item_id: String) -> String {
    return serde_json::to_string(&todo_item::get_tags(&app_handle, todo_item_id).unwrap())
        .unwrap();
}
