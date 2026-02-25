// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_derive::{Deserialize, Serialize};
use std::{self, path::PathBuf};
use tauri::api::dialog::blocking::FileDialogBuilder;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(default)]
struct PathConfig {
    sw_tile_path: String,
    addon_path: String,
}
impl Default for PathConfig {
    fn default() -> Self {
        Self {
            sw_tile_path: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Stormworks\\rom"
                .to_string(),
            addon_path: "C:\\".to_string(),
        }
    }
}

fn load_path_config() -> Result<PathConfig, String> {
    confy::load::<PathConfig>("storm-n-tracs-editor").map_err(|e| e.to_string())
}

fn store_path_config(config: PathConfig) -> Result<(), String> {
    confy::store("storm-n-tracs-editor", config).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_path_config_command() -> Result<PathConfig, String> {
    load_path_config()
}

#[tauri::command]
fn save_path_config_command(sw_tile_path: String, addon_path: String) -> Result<(), String> {
    store_path_config(PathConfig {
        sw_tile_path,
        addon_path,
    })
}

#[tauri::command]
fn read_tile_file_command(filename: String) -> Result<String, String> {
    let cfg = load_path_config()?;
    let dir = std::path::Path::new(&cfg.sw_tile_path);
    let filename = std::path::Path::new(&filename);
    std::fs::read_to_string(dir.join(filename)).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_addon_command(foldername: String) -> Result<String, String> {
    let cfg = load_path_config()?;
    let dir = std::path::Path::new(&cfg.addon_path);
    let filename = std::path::Path::new(&foldername).file_stem();

    match filename {
        Some(filename) => {
            std::fs::read_to_string(dir.join(filename).join("playlist.xml"))
                .map_err(|e| e.to_string())
        }
        None => Err("Cannot get settings".to_string()),
    }
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
        Some(filepath) => std::fs::write(filepath, save_value).map_err(|e| e.to_string()),
        None => Err("File select canceld.".to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_file_command,
            read_addon_command,
            read_tile_file_command,
            open_file_command,
            load_path_config_command,
            save_path_config_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}