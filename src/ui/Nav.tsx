import { Alignment, Button, Navbar } from "@blueprintjs/core";
import { invoke } from "@tauri-apps/api";

function save_file_command(data: string) {
  return invoke("save_file_command", { data: data }) as Promise<string>;
}

function Nav() {
  return (
    <Navbar
      fixedToTop={true}
      style={{
        background: "rgba(250,250,250,0.85)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>N-TRACS</Navbar.Heading>
        <Button className="bp5-minimal" text="Load" />
        <Button
          className="bp5-minimal"
          text="Save"
          onClick={() => save_file_command("")}
        />
        <Navbar.Divider />
        <Button className="bp5-minimal" text="Vertecies / Area" />
        <Button className="bp5-minimal" text="Track" />
        <Navbar.Divider />
      </Navbar.Group>
    </Navbar>
  );
}

export default Nav;
