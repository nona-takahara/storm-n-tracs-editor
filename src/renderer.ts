/// <reference path="./renderer.d.ts" />
addEventListener("DOMContentLoaded", async () => {
  const information = document.getElementById("info");
  if (information) {
    information.innerText = JSON.stringify(
      await window.electronAPI.loadRomTrack()
    );
  }
});
