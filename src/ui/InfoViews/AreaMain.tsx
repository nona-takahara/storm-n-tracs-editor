import { Button, ButtonGroup } from "@blueprintjs/core";
import { useEditorCommands } from "../../store/EditorStore";

function AreaMain() {
  const commands = useEditorCommands();

  return (
    <ButtonGroup>
      <Button onClick={commands.createArea}>Add Area</Button>
      <Button disabled={true}>Clean up Vertexes (WIP)</Button>
    </ButtonGroup>
  );
}

export default AreaMain;
