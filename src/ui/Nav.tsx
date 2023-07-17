import { Alignment, Button, Navbar } from "@blueprintjs/core";

function Nav() {
    return (
        <Navbar fixedToTop={true} style={{background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)'}}>
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading>N-TRACS</Navbar.Heading>
                <Navbar.Divider />
                <Button className="bp5-minimal" icon="home" text="Vertecies / Area" />
                <Button className="bp5-minimal" icon="document" text="Track" />
            </Navbar.Group>
        </Navbar>
    );
}

export default Nav;