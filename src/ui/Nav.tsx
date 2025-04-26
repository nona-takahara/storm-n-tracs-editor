import React from "react";
import { Alignment, Button, Divider, Navbar, Tab, TabId, Tabs } from "@blueprintjs/core";
import { FloppyDisk, Flows, FolderOpen, PolygonFilter } from "@blueprintjs/icons";
import * as EditMode from "../EditMode";

interface NavProps {
  onLoadButtonClick: React.MouseEventHandler;
  onSaveButtonClick: React.MouseEventHandler;
  setEditMode: React.Dispatch<EditMode.EditMode>;
}

function Nav(props: NavProps) {
  const changeTab = (tab: TabId) => {
    if (tab.toString() == "vaedit") {
      props.setEditMode(EditMode.EditArea);
    } else if(tab.toString() == "trackedit") {
      props.setEditMode(EditMode.EditTrack);
    }
  }

  return (
    <Navbar
      fixedToTop={true}
      style={{
        background: "rgba(250,250,250,0.85)",
        backdropFilter: "blur(8px)",
      }}
    >
        <Navbar.Group>
          <Navbar.Heading>N-TRACS Editor <small>v0.2.1</small></Navbar.Heading>
          <Navbar.Divider />
          <Button
            icon={<FolderOpen />}
            className="bp5-minimal"
            text="Load"
            onClick={props.onLoadButtonClick}
          />
          <Button
            icon={<FloppyDisk />}
            className="bp5-minimal"
            text="Save"
            onClick={props.onSaveButtonClick}
          />
          <Navbar.Divider />
          <Divider />
        <Tabs onChange={changeTab}>
          <Tab id="vaedit" title="Vertecies / Area" icon={<PolygonFilter />} />
          <Tab id="trackedit" title="Track Join" icon={<Flows />}/>
        </Tabs>
      </Navbar.Group>
    </Navbar>
  );
}

export default Nav;
