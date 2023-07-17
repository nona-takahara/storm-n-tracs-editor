import { Alignment, Button, Navbar } from "@blueprintjs/core";

function Nav() {
    return (
        <Navbar fixedToTop={true} style={{background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(8px)'}}>
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