/// <reference path="./renderer.d.ts" />
addEventListener("DOMContentLoaded", () => {
  const information = document.getElementById("info");
  if (information) {
    information.innerText = `This app is using Chrome (v${window.electronAPI.chrome()}), Node.js (v${window.electronAPI.node()}), and Electron (v${window.electronAPI.electron()})`;
  }
});
