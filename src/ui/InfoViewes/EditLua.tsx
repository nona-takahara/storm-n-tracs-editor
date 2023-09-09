import { Button, Dialog, DialogBody, DialogFooter, Divider, Intent, TextArea } from "@blueprintjs/core";
import { useState } from "react";

type EditLuaProps = {
  close: () => void;
  updateLuaCode: (list: string) => void;
  luaCode: string;
  selectedArea: string;
};

function EditLua(props: EditLuaProps) {
  const [text, setText] = useState(props.luaCode);
  const [update, setUpdate] = useState(false);

  const updateText: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => { setText(e.target.value); setUpdate(true) };
  const save = () => { props.updateLuaCode(text); setUpdate(false); }

  const title = props.selectedArea + (update ? "*" : "");

  return (
    <Dialog isOpen={true} onClose={props.close} title={title} canOutsideClickClose={false} canEscapeKeyClose={false} isCloseButtonShown={false}>
      <DialogBody>
        <TextArea autoResize={true} fill={true} onChange={updateText} value={text} style={{fontFamily: "'Consolas', monospace"}}/>
      </DialogBody>
      <DialogFooter actions={<>
        <Button onClick={() => { props.close(); }} intent={Intent.DANGER}>Close without Save</Button>
        <Button onClick={() => { save(); props.close(); }} intent={Intent.PRIMARY}>Save and Close</Button>
      </>
      }><Button onClick={() => { save(); }}>Save</Button></DialogFooter>
    </Dialog>
  )
}

export default EditLua;