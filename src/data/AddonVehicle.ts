// addon のスポーン車両情報を保持するモデル。
class AddonVehicle {
    public m00: number;
    public m01: number;
    public m10: number;
    public m11: number;
    // 回転行列要素が NaN の場合は単位行列相当へ補正する。
    constructor(public x: number, public z: number, public size_x: number, public size_z: number, m00: number, m01: number, m10: number, m11: number, public tag: string) {
        this.m00 = (Number.isNaN(m00)) ? 1 : m00;
        this.m01 = (Number.isNaN(m01)) ? 0 : m01;
        this.m10 = (Number.isNaN(m10)) ? 0 : m10;
        this.m11 = (Number.isNaN(m11)) ? 1 : m11;
    }
}

export default AddonVehicle;
