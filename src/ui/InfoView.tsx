import { Card, Radio, RadioGroup } from "@blueprintjs/core";
import AreaPolygon from "../data/AreaPolygon";
import Project from "../data/Project";
import Vector2d from "../data/Vector2d";

type InfoViewProps = {
    selectedArea: string | undefined;
    vertexes: Map<string, Vector2d>;
    areas: Map<string, AreaPolygon>;
}

function InfoView(props: InfoViewProps) {
    const ssarea = props.selectedArea && props.areas.get(props.selectedArea) || {name: "", vertexes: [], leftVertexInnerId: 0};
    return (<Card elevation={1} style={{
        position: "absolute",
        width: "300px",
        top: "60px",
        right: "10px",
        background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(8px)'}}>
        <b>{props.selectedArea}</b>
        <RadioGroup onChange={()=>{
            
        }} selectedValue={ssarea?.vertexes[ssarea?.leftVertexInnerId]}>
        {ssarea?.vertexes.map((v) => {
            const vx = props.vertexes.get(v)
                
            if (vx) {
                return (
                    <Radio label={`${v}: ${vx.x}, ${vx.z}`} value={v}/>
                )
            } else {
                return undefined;
            }
        })}
        </RadioGroup>
    </Card>);
}

export default InfoView;