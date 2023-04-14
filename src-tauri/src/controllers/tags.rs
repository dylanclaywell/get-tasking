use crate::models::tag;
use uuid::Uuid;

#[tauri::command]
pub fn get_tags() -> String {
    return serde_json::to_string(&tag::get_all()).unwrap();
}

#[tauri::command]
pub fn create_tag(name: String, color: String) -> String {
    let id = Uuid::new_v4().to_string();
    let tag = tag::create(id, name, color);
    return serde_json::to_string(&tag).unwrap();
}

#[tauri::command]
pub fn update_tag(id: String, name: Option<String>, color: Option<String>) {
    tag::update(id, name, color);
}

#[tauri::command]
pub fn delete_tag(id: String) {
    tag::delete(id);
}
