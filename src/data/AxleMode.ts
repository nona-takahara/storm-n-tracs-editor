export const NoChange = "none";
export const Up = "upbound";
export const Down = "downbound";

type AxleMode = typeof NoChange | typeof Up | typeof Down

export function modeFromStr(str: string) {
    if (str == "upbound") return Up;
    if (str == "downbound") return Down;
    return NoChange;
}

export default AxleMode;