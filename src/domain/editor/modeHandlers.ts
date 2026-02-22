import * as EditMode from "../../EditMode";

interface StagePrimaryDownContext {
  mode: EditMode.EditMode;
  nearestVertex: string | undefined;
  selectedAreaFirstVertex: string | undefined;
  shiftKey: boolean;
}

export type StagePrimaryDownAction =
  | { type: "append-new-vertex" }
  | { type: "append-existing-vertex"; vertexId: string }
  | { type: "finish-add-area" }
  | { type: "select-area" }
  | { type: "none" };

export type StageSecondaryDownAction = "finish-add-area" | "none";

interface StageModeHandler {
  onPrimaryDown: (context: StagePrimaryDownContext) => StagePrimaryDownAction;
  onSecondaryDown: () => StageSecondaryDownAction;
}

const editAreaHandler: StageModeHandler = {
  onPrimaryDown: () => ({ type: "select-area" }),
  onSecondaryDown: () => "none",
};

const editTrackHandler: StageModeHandler = {
  onPrimaryDown: () => ({ type: "select-area" }),
  onSecondaryDown: () => "none",
};

const addAreaHandler: StageModeHandler = {
  onPrimaryDown: (context) => {
    if (!context.nearestVertex || context.shiftKey) {
      return { type: "append-new-vertex" };
    }

    if (context.nearestVertex === context.selectedAreaFirstVertex) {
      return { type: "finish-add-area" };
    }

    return { type: "append-existing-vertex", vertexId: context.nearestVertex };
  },
  onSecondaryDown: () => "finish-add-area",
};

const handlers: Record<EditMode.EditMode, StageModeHandler> = {
  [EditMode.EditArea]: editAreaHandler,
  [EditMode.EditTrack]: editTrackHandler,
  [EditMode.AddArea]: addAreaHandler,
};

export function resolveStagePrimaryDown(
  context: StagePrimaryDownContext
): StagePrimaryDownAction {
  return handlers[context.mode].onPrimaryDown(context);
}

export function resolveStageSecondaryDown(
  mode: EditMode.EditMode
): StageSecondaryDownAction {
  return handlers[mode].onSecondaryDown();
}
