import { Card } from "@blueprintjs/core";
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
        <ul>
        {props.selectedArea?.vertexes.map((v) => {
            const vx = props.project.vertexes.get(v)
                
            if (vx) {
                return (
                    <li>{v}: {vx.x}, {vx.z}</li>
                )
            } else {
                return undefined;
            }
        })}
        </ul>
    </Card>);
}

export default InfoView;