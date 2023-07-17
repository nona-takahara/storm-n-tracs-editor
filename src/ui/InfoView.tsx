import { Card } from "@blueprintjs/core";

function InfoView(props: any) {
    let info = <></>
    if (props.selectedArea) {
        info = <p>{props.selectedArea.name}</p>
    }
    return (<Card elevation={1} style={{
        position: "absolute",
        width: "300px",
        top: "60px",
        right: "10px",
        background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(8px)'}}>
        {info}
    </Card>);
}

export default InfoView;