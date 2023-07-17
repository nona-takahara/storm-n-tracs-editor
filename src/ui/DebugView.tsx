import { Card } from "@blueprintjs/core";

function DebugView(props: any) {
    return (<Card elevation={1} style={{
        position: "absolute",
        width: "300px",
        top: "56px",
        right: "6px",
        background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(8px)'}}>
        {props.children}
    </Card>);
}

export default DebugView;