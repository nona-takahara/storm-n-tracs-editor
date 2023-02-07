export const romPath =
  "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Stormworks\\rom\\data\\tiles";

export const tiles: { [name: string]: any } = (() => {
  let data: { [name: string]: any } = {};
  for (let x = 8; x <= 15; x++) {
    for (let y = 0; y <= 8; y++) {
      data[`mega_island_${x.toFixed(0)}_${y.toFixed(0)}.xml`] = {
        offsetX: x * 1000 - 8000,
        offsetY: y * 1000 - 12000
      };
    }
  }
  return data;
})();
