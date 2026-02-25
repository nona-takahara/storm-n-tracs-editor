import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
  Intent,
} from "@blueprintjs/core";
import { ChangeEventHandler, useEffect, useMemo, useState } from "react";

interface ProjectSettingsDialogProps {
  isOpen: boolean;
  originX: number;
  originZ: number;
  onSaveOrigin: (x: number, z: number) => void;
  onClose: () => void;
}

function ProjectSettingsDialog(props: ProjectSettingsDialogProps) {
  const [originXText, setOriginXText] = useState("0");
  const [originZText, setOriginZText] = useState("0");
  const [errorText, setErrorText] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!props.isOpen) {
      return;
    }

    setOriginXText(String(props.originX));
    setOriginZText(String(props.originZ));
    setErrorText(undefined);
  }, [props.isOpen, props.originX, props.originZ]);

  const updateOriginX: ChangeEventHandler<HTMLInputElement> = (event) => {
    setOriginXText(event.target.value);
  };

  const updateOriginZ: ChangeEventHandler<HTMLInputElement> = (event) => {
    setOriginZText(event.target.value);
  };

  const parsedOrigin = useMemo(() => {
    const x = Number(originXText);
    const z = Number(originZText);
    return {
      x,
      z,
      valid: Number.isFinite(x) && Number.isFinite(z),
    };
  }, [originXText, originZText]);

  const dirty =
    parsedOrigin.valid &&
    (parsedOrigin.x !== props.originX || parsedOrigin.z !== props.originZ);

  const save = () => {
    if (!parsedOrigin.valid) {
      setErrorText("Origin X/Z must be valid numbers.");
      return;
    }

    props.onSaveOrigin(parsedOrigin.x, parsedOrigin.z);
    props.onClose();
  };

  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Project Settings"
      canOutsideClickClose={true}
      canEscapeKeyClose={true}
    >
      <DialogBody>
        <FormGroup label="Project origin X" labelFor="project-origin-x-input">
          <InputGroup
            id="project-origin-x-input"
            value={originXText}
            onChange={updateOriginX}
            type="number"
          />
        </FormGroup>

        <FormGroup label="Project origin Z" labelFor="project-origin-z-input">
          <InputGroup
            id="project-origin-z-input"
            value={originZText}
            onChange={updateOriginZ}
            type="number"
          />
        </FormGroup>

        <div style={{ color: "#5f6b7c", fontSize: "12px" }}>
          Saved into project.json as origin_x / origin_z.
        </div>

        {errorText && (
          <div style={{ color: "#c23030", marginTop: "8px", whiteSpace: "pre-wrap" }}>
            {errorText}
          </div>
        )}
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button onClick={props.onClose}>Close</Button>
            <Button
              intent={Intent.PRIMARY}
              onClick={save}
              disabled={!dirty || !parsedOrigin.valid}
            >
              Save
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

export default ProjectSettingsDialog;