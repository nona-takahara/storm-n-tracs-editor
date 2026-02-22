import React from "react";
import { Button, Divider, Navbar, Tab, TabId, Tabs } from "@blueprintjs/core";
import { FloppyDisk, Flows, FolderOpen, PolygonFilter } from "@blueprintjs/icons";
import { saveProject, loadProject } from "../services/projectService";
import { useEditorCommands, useEditorSelector } from "../store/EditorStore";
import { APP_VERSION } from "../appVersion";

function Nav() {
  const commands = useEditorCommands();
  const vertexes = useEditorSelector((state) => state.vertexes);
  const areas = useEditorSelector((state) => state.areas);
  const addonList = useEditorSelector((state) => state.addonList);
  const tileAssign = useEditorSelector((state) => state.tileAssign);
  const nttracks = useEditorSelector((state) => state.nttracks);

  const handleLoad = () => {
    loadProject()
      .then((project) => {
        commands.hydrateProject(project);
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  };

  const handleSave = () => {
    saveProject({
      vertexes,
      areas,
      addons: addonList,
      tileAssign,
      nttracks,
    }).catch((error: unknown) => {
      console.error(error);
    });
  };

  const changeTab = (tab: TabId) => {
    if (tab.toString() === "vaedit") {
      commands.sendModeEvent("OPEN_AREA_EDITOR");
    } else if (tab.toString() === "trackedit") {
      commands.sendModeEvent("OPEN_TRACK_EDITOR");
    }
  };

  return (
    <Navbar
      fixedToTop={true}
      style={{
        background: "rgba(250,250,250,0.85)",
        backdropFilter: "blur(8px)",
      }}
    >
        <Navbar.Group>
          <Navbar.Heading>N-TRACS Editor <small>v{APP_VERSION}</small></Navbar.Heading>
          <Navbar.Divider />
          <Button
            icon={<FolderOpen />}
            className="bp5-minimal"
            text="Load"
            onClick={handleLoad}
          />
          <Button
            icon={<FloppyDisk />}
            className="bp5-minimal"
            text="Save"
            onClick={handleSave}
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
