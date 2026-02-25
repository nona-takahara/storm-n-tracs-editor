import React, { useState } from "react";
import { Button, Divider, Navbar, Tab, TabId, Tabs } from "@blueprintjs/core";
import { Cog, FloppyDisk, Flows, FolderOpen, PolygonFilter } from "@blueprintjs/icons";
import { APP_VERSION } from "../appVersion";
import { loadProject, renumberAreaIds, saveProject } from "../services/projectService";
import { useEditorCommands, useEditorSelector } from "../store/EditorStore";
import ProjectSettingsDialog from "./ProjectSettingsDialog";
import SettingsDialog from "./SettingsDialog";

function Nav() {
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false);
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);

  const commands = useEditorCommands();
  const vertexes = useEditorSelector((state) => state.vertexes);
  const areas = useEditorSelector((state) => state.areas);
  const addonList = useEditorSelector((state) => state.addonList);
  const tileAssign = useEditorSelector((state) => state.tileAssign);
  const nttracks = useEditorSelector((state) => state.nttracks);
  const origin = useEditorSelector((state) => state.origin);
  const vehicles = useEditorSelector((state) => state.vehicles);
  const swtracks = useEditorSelector((state) => state.swtracks);

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
      origin,
    })
      .then((cleaned) => {
        commands.hydrateProject({
          vertexes: cleaned.vertexes,
          areas: cleaned.areas,
          tileAssign: cleaned.tileAssign,
          addonList: cleaned.addons,
          origin: cleaned.origin,
          nttracks: cleaned.nttracks,
          vehicles,
          swtracks,
        });
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  };

  const handleRenumberAreaIds = () => {
    const renumbered = renumberAreaIds({
      vertexes,
      areas,
      addons: addonList,
      tileAssign,
      nttracks,
      origin,
    });

    commands.hydrateProject({
      vertexes: renumbered.vertexes,
      areas: renumbered.areas,
      tileAssign: renumbered.tileAssign,
      addonList: renumbered.addons,
      origin: renumbered.origin,
      nttracks: renumbered.nttracks,
      vehicles,
      swtracks,
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
    <>
      <Navbar
        fixedToTop={true}
        style={{
          background: "rgba(250,250,250,0.85)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Navbar.Group>
          <Navbar.Heading>
            N-TRACS Editor <small>v{APP_VERSION}</small>
          </Navbar.Heading>
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
          <Button
            icon={<Cog />}
            className="bp5-minimal"
            text="Config"
            onClick={() => {
              setGlobalSettingsOpen(true);
            }}
          />
          <Button
            icon={<Cog />}
            className="bp5-minimal"
            text="Project"
            onClick={() => {
              setProjectSettingsOpen(true);
            }}
          />
          <Navbar.Divider />
          <Divider />
          <Button
            className="bp5-minimal"
            text="Renumber Area IDs"
            onClick={handleRenumberAreaIds}
          />
          <Navbar.Divider />
          <Divider />
          <Tabs onChange={changeTab}>
            <Tab id="vaedit" title="Vertecies / Area" icon={<PolygonFilter />} />
            <Tab id="trackedit" title="Track Join" icon={<Flows />} />
          </Tabs>
        </Navbar.Group>
      </Navbar>

      <ProjectSettingsDialog
        isOpen={projectSettingsOpen}
        originX={origin.x}
        originZ={origin.z}
        onSaveOrigin={(x, z) => {
          commands.setProjectOrigin(x, z);
        }}
        onClose={() => {
          setProjectSettingsOpen(false);
        }}
      />

      <SettingsDialog
        isOpen={globalSettingsOpen}
        onClose={() => {
          setGlobalSettingsOpen(false);
        }}
      />
    </>
  );
}

export default Nav;
