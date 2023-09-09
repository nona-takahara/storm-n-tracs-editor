import { Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";

type EditLuaProps = {
    close: () => void;
};

function EditLua(props: EditLuaProps) {
  return (
    <Dialog isOpen={true} onClose={() => props.close()}>
        <DialogBody></DialogBody>
        <DialogFooter></DialogFooter>
    </Dialog>
  )
}

export default EditLua;