import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Intent,
  TextArea,
} from "@blueprintjs/core";
import { useState } from "react";

interface EditLuaProps {
  close: () => void;
  updateLuaCode: (list: string) => void;
  luaCode: string;
  selectedArea: string;
}

function EditLua(props: EditLuaProps) {
  const [text, setText] = useState(props.luaCode);
  const [updated, setUpdated] = useState(false);

  const updateText: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    setText(event.target.value);
    setUpdated(true);
  };

  const save = () => {
    props.updateLuaCode(text);
    setUpdated(false);
  };

  const title = props.selectedArea + (updated ? "*" : "");

  return (
    <Dialog
      isOpen={true}
      onClose={props.close}
      title={title}
      canOutsideClickClose={false}
      canEscapeKeyClose={false}
      isCloseButtonShown={false}
    >
      <DialogBody>
        <TextArea
          autoResize={true}
          fill={true}
          onChange={updateText}
          value={text}
          style={{ fontFamily: "'Consolas', monospace" }}
        />
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button onClick={props.close} intent={Intent.DANGER}>
              Close without Save
            </Button>
            <Button
              onClick={() => {
                save();
                props.close();
              }}
              intent={Intent.PRIMARY}
            >
              Save and Close
            </Button>
          </>
        }
      >
        <Button onClick={save}>Save</Button>
      </DialogFooter>
    </Dialog>
  );
}

export default EditLua;
