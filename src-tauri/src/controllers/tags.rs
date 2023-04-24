use crate::models::tag;
use tauri::AppHandle;
use uuid::Uuid;

#[tauri::command]
pub fn get_tags(app_handle: AppHandle) -> String {
    return serde_json::to_string(&tag::get_all(&app_handle).unwrap()).unwrap();
}

#[tauri::command]
pub fn create_tag(app_handle: AppHandle, name: String, color: String) -> String {
    let id = Uuid::new_v4().to_string();
    let tag = tag::create(&app_handle, id, name, color);
    return serde_json::to_string(&tag.unwrap()).unwrap();
}

#[tauri::command]
pub fn update_tag(app_handle: AppHandle, id: String, name: Option<String>, color: Option<String>) {
    if tag::update(&app_handle, id, name, color).is_err() {
        println!("Failed to update tag");
    }
}

#[tauri::command]
pub fn delete_tag(app_handle: AppHandle, id: String) {
    if tag::delete(&app_handle, id).is_err() {
        println!("Failed to delete tag");
    }
}
