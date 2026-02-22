#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, "package.json");
const cargoTomlPath = path.join(rootDir, "src-tauri", "Cargo.toml");
const tauriConfigPath = path.join(rootDir, "src-tauri", "tauri.conf.json");
const uiVersionPath = path.join(rootDir, "src", "appVersion.ts");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readCargoToml() {
  return fs.readFileSync(cargoTomlPath, "utf8");
}

function getCargoVersion(cargoTomlText) {
  const match = cargoTomlText.match(/\[package\][\s\S]*?^\s*version\s*=\s*"([^"]+)"/m);
  if (!match) {
    throw new Error("Could not find [package].version in src-tauri/Cargo.toml");
  }
  return match[1];
}

function setCargoVersion(cargoTomlText, nextVersion) {
  const updated = cargoTomlText.replace(
    /(\[package\][\s\S]*?^\s*version\s*=\s*")([^"]+)(")/m,
    `$1${nextVersion}$3`,
  );

  if (updated === cargoTomlText) {
    throw new Error("Failed to update [package].version in src-tauri/Cargo.toml");
  }

  return updated;
}

function readUiVersionFile() {
  return fs.readFileSync(uiVersionPath, "utf8");
}

function getUiVersion(uiVersionText) {
  const match = uiVersionText.match(/export\s+const\s+APP_VERSION\s*=\s*"([^"]+)"\s*;?/m);
  if (!match) {
    throw new Error("Could not find APP_VERSION in src/appVersion.ts");
  }
  return match[1];
}

function setUiVersion(nextVersion) {
  const nextText = `export const APP_VERSION = "${nextVersion}";\n`;
  fs.writeFileSync(uiVersionPath, nextText, "utf8");
}

function getVersions() {
  const packageJson = readJson(packageJsonPath);
  const cargoTomlText = readCargoToml();
  const tauriConfig = readJson(tauriConfigPath);
  const uiVersionText = readUiVersionFile();

  const packageVersion = packageJson.version;
  const cargoVersion = getCargoVersion(cargoTomlText);
  const tauriVersion = tauriConfig?.package?.version;
  const uiVersion = getUiVersion(uiVersionText);

  if (typeof packageVersion !== "string" || packageVersion.length === 0) {
    throw new Error("package.json version is missing or invalid");
  }
  if (typeof tauriVersion !== "string" || tauriVersion.length === 0) {
    throw new Error("src-tauri/tauri.conf.json package.version is missing or invalid");
  }

  return {
    packageVersion,
    cargoVersion,
    tauriVersion,
    uiVersion,
    cargoTomlText,
    tauriConfig,
  };
}

function check() {
  const { packageVersion, cargoVersion, tauriVersion, uiVersion } = getVersions();
  console.log(`package.json: ${packageVersion}`);
  console.log(`src-tauri/Cargo.toml: ${cargoVersion}`);
  console.log(`src-tauri/tauri.conf.json: ${tauriVersion}`);
  console.log(`src/appVersion.ts: ${uiVersion}`);

  const allMatch =
    packageVersion === cargoVersion &&
    packageVersion === tauriVersion &&
    packageVersion === uiVersion;

  if (!allMatch) {
    console.error("Version mismatch detected. Run: npm run version:sync");
    process.exit(1);
  }

  console.log("Versions are consistent.");
}

function sync() {
  const {
    packageVersion,
    cargoVersion,
    tauriVersion,
    uiVersion,
    cargoTomlText,
    tauriConfig,
  } = getVersions();
  let changed = false;

  if (cargoVersion !== packageVersion) {
    const updatedCargo = setCargoVersion(cargoTomlText, packageVersion);
    fs.writeFileSync(cargoTomlPath, updatedCargo, "utf8");
    changed = true;
    console.log(`Updated src-tauri/Cargo.toml: ${cargoVersion} -> ${packageVersion}`);
  }

  if (tauriVersion !== packageVersion) {
    tauriConfig.package.version = packageVersion;
    fs.writeFileSync(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 2)}\n`, "utf8");
    changed = true;
    console.log(`Updated src-tauri/tauri.conf.json: ${tauriVersion} -> ${packageVersion}`);
  }

  if (uiVersion !== packageVersion) {
    setUiVersion(packageVersion);
    changed = true;
    console.log(`Updated src/appVersion.ts: ${uiVersion} -> ${packageVersion}`);
  }

  if (!changed) {
    console.log("No changes. Versions are already consistent.");
  }

  check();
}

const mode = process.argv[2] ?? "check";
if (mode === "check") {
  check();
} else if (mode === "sync") {
  sync();
} else {
  console.error("Usage: node scripts/version-consistency.mjs [check|sync]");
  process.exit(1);
}