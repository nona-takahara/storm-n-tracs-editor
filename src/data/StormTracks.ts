function itr(item: any[] | any): any[] {
    if (item?.length) {
        return item;
    } else {
        return [item];
    }
}

class StormTracks {
    static loadFromXML(xmlObject: any): StormTracks {
        const tir = xmlObject?.definition?.train_tracks?.track;
        let list: any = {};
        if (tir) {
            const fitr = itr(tir);
            for (const i of fitr) {
                if (i?.["@_id"]) {
                    list[i["@_id"]] = {
                        x: Number(i.transform["@_30"]),
                        z: Number(i.transform["@_32"]),
                        links:
                            i.links.link?.map === undefined
                                ? [((i?.links?.link?.["@_id"]) as string) || ""]
                                : (i.links.link as Array<any>).map(
                                    (v: any) => (v["@_id"]) as string
                                )
                    };
                }
            }
        }
        return {};
    }
}

export default StormTracks;