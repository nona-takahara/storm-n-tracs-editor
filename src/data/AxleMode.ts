// axle mode の定数定義。
export const NoChange = "none";
export const Up = "upbound";
export const Down = "downbound";

type AxleMode = typeof NoChange | typeof Up | typeof Down

// 文字列を AxleMode へ正規化する。
export function modeFromStr(str: string) {
    if (str == "upbound") return Up;
    if (str == "downbound") return Down;
    return NoChange;
}

export default AxleMode;
