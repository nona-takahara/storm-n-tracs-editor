import { Card, Radio, RadioGroup } from "@blueprintjs/core";
import AreaPolygon from "../data/AreaPolygon";
import Project from "../data/Project";

type InfoViewProps = {
    selectedArea: AreaPolygon | undefined;
    project: Project;
}

function InfoView(props: InfoViewProps) {
    return (<Card elevation={1} style={{
        position: "absolute",
        width: "300px",
        top: "60px",
        right: "10px",
        background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(8px)'}}>
        <b>{props.selectedArea?.name}</b>
        <RadioGroup onChange={()=>{
            
        }} selectedValue={props.selectedArea?.vertexes[props.selectedArea?.leftVertexInnerId]}>
        {props.selectedArea?.vertexes.map((v) => {
            const vx = props.project.vertexes.get(v)
                
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