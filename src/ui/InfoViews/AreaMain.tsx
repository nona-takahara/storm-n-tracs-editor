import { Button } from "@blueprintjs/core";
import { useEditorCommands } from "../../store/EditorStore";

function AreaMain() {
  const commands = useEditorCommands();

  return <Button onClick={commands.createArea}>Add Area</Button>;
}

export default AreaMain;
