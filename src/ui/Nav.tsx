import React from "react";
import { Alignment, Button, Navbar } from "@blueprintjs/core";

type NavProps = {
  onLoadButtonClick: React.MouseEventHandler;
  onSaveButtonClick: React.MouseEventHandler;
};

function Nav(props: NavProps) {
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
        <Button
          className="bp5-minimal"
          text="Load"
          onClick={props.onLoadButtonClick}
        />
        <Button
          className="bp5-minimal"
          text="Save"
          onClick={props.onSaveButtonClick}
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
