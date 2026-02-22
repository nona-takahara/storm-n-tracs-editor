export const EditArea = "edit-area" as const;
export const AddArea = "add-area" as const;
export const EditTrack = "edit-track" as const;

export type EditMode = typeof EditArea | typeof AddArea | typeof EditTrack;

export type EditModeEvent =
  | "OPEN_AREA_EDITOR"
  | "OPEN_TRACK_EDITOR"
  | "START_ADD_AREA"
  | "FINISH_ADD_AREA"
  | "CANCEL_ADD_AREA";

const transitions: Record<EditMode, Partial<Record<EditModeEvent, EditMode>>> = {
  [EditArea]: {
    OPEN_AREA_EDITOR: EditArea,
    OPEN_TRACK_EDITOR: EditTrack,
    START_ADD_AREA: AddArea,
  },
  [AddArea]: {
    OPEN_AREA_EDITOR: EditArea,
    OPEN_TRACK_EDITOR: EditTrack,
    FINISH_ADD_AREA: EditArea,
    CANCEL_ADD_AREA: EditArea,
  },
  [EditTrack]: {
    OPEN_AREA_EDITOR: EditArea,
    OPEN_TRACK_EDITOR: EditTrack,
  },
};

export function transitionEditMode(
  currentMode: EditMode,
  event: EditModeEvent
): EditMode {
  return transitions[currentMode][event] ?? currentMode;
}

