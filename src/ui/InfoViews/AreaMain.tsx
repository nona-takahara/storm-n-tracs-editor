import { Button, ButtonGroup } from "@blueprintjs/core";
import { renumberAreaIds } from "../../services/projectService";
import { useEditorCommands, useEditorSelector } from "../../store/EditorStore";

function AreaMain() {
  const commands = useEditorCommands();
  const vertexes = useEditorSelector((state) => state.vertexes);
  const areas = useEditorSelector((state) => state.areas);
  const addonList = useEditorSelector((state) => state.addonList);
  const tileAssign = useEditorSelector((state) => state.tileAssign);
  const nttracks = useEditorSelector((state) => state.nttracks);
  const origin = useEditorSelector((state) => state.origin);
  const vehicles = useEditorSelector((state) => state.vehicles);
  const swtracks = useEditorSelector((state) => state.swtracks);

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

  return (
    <ButtonGroup>
      <Button onClick={commands.createArea}>Add Area</Button>
      <Button onClick={handleRenumberAreaIds}>Renumber Area IDs</Button>
    </ButtonGroup>
  );
}

export default AreaMain;
