// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{self, fs::File, io::Write, path::PathBuf};
use tauri::api::dialog::blocking::FileDialogBuilder;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn read_file_command(path: String) -> Result<String, String> {
    let filepath = std::path::Path::new(&path);
    let content = match std::fs::read_to_string(filepath) {
        Ok(content) => content,
        Err(e) => return Err(e.to_string()),
    };
    Ok(content)
}

#[tauri::command]
fn open_file_command() -> Result<String, String> {
    let path: Option<PathBuf> = FileDialogBuilder::new()
        .add_filter("JSON file", &["json"])
        .pick_file();
    match path {
        Some(filepath) => {
            let content = match std::fs::read_to_string(filepath) {
                Ok(content) => content,
                Err(e) => return Err(e.to_string()),
            };
            return Ok(content);
        }
        None => return Err("File select canceld.".to_string()),
    };
}

#[tauri::command]
fn save_file_command(save_value: String) -> Result<(), String> {
    let path: Option<PathBuf> = FileDialogBuilder::new()
        .add_filter("JSON file", &["json"])
        .save_file();
    match path {
        Some(filepath) => {
            let file = File::create(filepath);
            match file {
                Ok(mut fs) => {
                    let write = fs.write_all(save_value.as_bytes());
                    match write {
                        Ok(_) => return Ok(()),
                        Err(e) => return Err(e.to_string()),
                    }
                }
                Err(e) => return Err(e.to_string()),
            }
        }
        None => return Err("File select canceld.".to_string()),
    };
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_file_command,
            read_file_command,
            open_file_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
