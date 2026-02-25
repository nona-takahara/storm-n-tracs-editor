import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
  Intent,
  Spinner,
} from "@blueprintjs/core";
import { FolderOpen } from "@blueprintjs/icons";
import { open } from "@tauri-apps/api/dialog";
import { ChangeEventHandler, useEffect, useMemo, useState } from "react";
import { AppPathConfig, loadPathConfig, savePathConfig } from "../services/projectService";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function SettingsDialog(props: SettingsDialogProps) {
  const [swTilePath, setSwTilePath] = useState("");
  const [addonPath, setAddonPath] = useState("");
  const [baseline, setBaseline] = useState<AppPathConfig | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!props.isOpen) {
      return;
    }

    let disposed = false;
    setLoading(true);
    setSaving(false);
    setErrorText(undefined);

    loadPathConfig()
      .then((config) => {
        if (disposed) {
          return;
        }

        setSwTilePath(config.swTilePath);
        setAddonPath(config.addonPath);
        setBaseline(config);
      })
      .catch((error: unknown) => {
        if (disposed) {
          return;
        }

        setSwTilePath("");
        setAddonPath("");
        setBaseline({ swTilePath: "", addonPath: "" });
        setErrorText(String(error));
      })
      .finally(() => {
        if (disposed) {
          return;
        }

        setLoading(false);
      });

    return () => {
      disposed = true;
    };
  }, [props.isOpen]);

  const updateSwTilePath: ChangeEventHandler<HTMLInputElement> = (event) => {
    setSwTilePath(event.target.value);
  };

  const updateAddonPath: ChangeEventHandler<HTMLInputElement> = (event) => {
    setAddonPath(event.target.value);
  };

  const dirty = useMemo(() => {
    if (!baseline) {
      return false;
    }

    return swTilePath !== baseline.swTilePath || addonPath !== baseline.addonPath;
  }, [addonPath, baseline, swTilePath]);

  const canSave =
    !loading &&
    !saving &&
    swTilePath.trim().length > 0 &&
    addonPath.trim().length > 0 &&
    dirty;

  const browseDirectory = async (
    currentPath: string,
    setPath: (path: string) => void
  ): Promise<void> => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: currentPath || undefined,
      });
      if (typeof selected === "string") {
        setPath(selected);
      }
    } catch (error) {
      setErrorText(String(error));
    }
  };

  const save = async (): Promise<boolean> => {
    if (!canSave) {
      return false;
    }

    const nextConfig: AppPathConfig = {
      swTilePath: swTilePath.trim(),
      addonPath: addonPath.trim(),
    };

    setSaving(true);
    setErrorText(undefined);
    try {
      await savePathConfig(nextConfig);
      setBaseline(nextConfig);
      return true;
    } catch (error) {
      setErrorText(String(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveAndClose = async (): Promise<void> => {
    const saved = await save();
    if (saved) {
      props.onClose();
    }
  };

  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Global Settings"
      canOutsideClickClose={!saving}
      canEscapeKeyClose={!saving}
    >
      <DialogBody>
        {loading ? (
          <div
            style={{
              minHeight: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner size={24} />
          </div>
        ) : (
          <>
            <FormGroup label="Stormworks tile path" labelFor="sw-tile-path-input">
              <div style={{ display: "flex", gap: "8px" }}>
                <InputGroup
                  id="sw-tile-path-input"
                  fill={true}
                  value={swTilePath}
                  onChange={updateSwTilePath}
                  disabled={saving}
                />
                <Button
                  icon={<FolderOpen />}
                  onClick={() => {
                    void browseDirectory(swTilePath, setSwTilePath);
                  }}
                  disabled={saving}
                />
              </div>
            </FormGroup>

            <FormGroup label="Addon path" labelFor="addon-path-input">
              <div style={{ display: "flex", gap: "8px" }}>
                <InputGroup
                  id="addon-path-input"
                  fill={true}
                  value={addonPath}
                  onChange={updateAddonPath}
                  disabled={saving}
                />
                <Button
                  icon={<FolderOpen />}
                  onClick={() => {
                    void browseDirectory(addonPath, setAddonPath);
                  }}
                  disabled={saving}
                />
              </div>
            </FormGroup>
          </>
        )}

        {errorText && (
          <div style={{ color: "#c23030", marginTop: "8px", whiteSpace: "pre-wrap" }}>
            {errorText}
          </div>
        )}
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button onClick={props.onClose} disabled={saving}>
              Close
            </Button>
            <Button
              intent={Intent.PRIMARY}
              onClick={() => {
                void saveAndClose();
              }}
              loading={saving}
              disabled={!canSave}
            >
              Save
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

export default SettingsDialog;