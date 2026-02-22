import * as EditMode from "../../EditMode";

export type EditModeEvent =
  | "OPEN_AREA_EDITOR"
  | "OPEN_TRACK_EDITOR"
  | "START_ADD_AREA"
  | "FINISH_ADD_AREA"
  | "CANCEL_ADD_AREA";

const transitions: Record<
  EditMode.EditMode,
  Partial<Record<EditModeEvent, EditMode.EditMode>>
> = {
  [EditMode.EditArea]: {
    OPEN_AREA_EDITOR: EditMode.EditArea,
    OPEN_TRACK_EDITOR: EditMode.EditTrack,
    START_ADD_AREA: EditMode.AddArea,
  },
  [EditMode.AddArea]: {
    OPEN_AREA_EDITOR: EditMode.EditArea,
    OPEN_TRACK_EDITOR: EditMode.EditTrack,
    FINISH_ADD_AREA: EditMode.EditArea,
    CANCEL_ADD_AREA: EditMode.EditArea,
  },
  [EditMode.EditTrack]: {
    OPEN_AREA_EDITOR: EditMode.EditArea,
    OPEN_TRACK_EDITOR: EditMode.EditTrack,
  },
};

export function transitionEditMode(
  currentMode: EditMode.EditMode,
  event: EditModeEvent
): EditMode.EditMode {
  return transitions[currentMode][event] ?? currentMode;
}
