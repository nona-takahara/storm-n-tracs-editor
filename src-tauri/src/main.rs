// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn read_file_command(path: String) -> Result<String, String>{
  let filepath = std::path::Path::new(&path);
  let content = match std::fs::read_to_string(filepath){
    Ok(content) => content,
    Err(e) => return Err(e.to_string()),
  };
  Ok(content)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
