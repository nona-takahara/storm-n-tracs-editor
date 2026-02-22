import React, { createContext, useContext, useMemo, useReducer } from "react";
import * as EditMode from "../EditMode";
import Vector2d from "../data/Vector2d";
import { EditorAction, editorReducer } from "./editorReducer";
import { createInitialEditorState, EditorState, LoadedProjectData } from "./editorTypes";

interface EditorCommands {
  hydrateProject: (data: LoadedProjectData) => void;
  sendModeEvent: (event: EditMode.EditModeEvent) => void;
  setSelectedArea: (areaId: string | undefined) => void;
  setSelectedTrack: (trackId: string | undefined) => void;
  createArea: () => void;
  insertVertexBetween: (index: number) => void;
  removeVertexFromSelectedArea: (index: number) => void;
  deleteSelectedArea: () => void;
  updateSelectedAreaLua: (callback: string) => void;
  addSelectedAreaUparea: (uparea: string) => void;
  removeSelectedAreaUparea: (uparea: string) => void;
  setSelectedAreaLeftVertex: (vertexId: string) => void;
  createTrack: (trackId: string) => void;
  deleteSelectedTrack: () => void;
  addSelectedAreaToTrack: () => void;
  clearSelectedTrack: () => void;
  cycleTrackFlag: (index: number) => void;
  removeTrackArea: (index: number) => void;
  stagePointerMove: (point: Vector2d, dragging: boolean) => void;
  stagePrimaryDown: (point: Vector2d, shiftKey: boolean) => void;
  stageSecondaryDown: () => void;
  stagePrimaryUp: (ctrlKey: boolean) => void;
}

const EditorStateContext = createContext<EditorState | undefined>(undefined);
const EditorDispatchContext = createContext<React.Dispatch<EditorAction> | undefined>(
  undefined
);
const EditorCommandsContext = createContext<EditorCommands | undefined>(undefined);

function useEditorStateContext(): EditorState {
  const state = useContext(EditorStateContext);
  if (!state) {
    throw new Error("useEditorSelector must be used within EditorStoreProvider");
  }
  return state;
}

function useEditorDispatchContext(): React.Dispatch<EditorAction> {
  const dispatch = useContext(EditorDispatchContext);
  if (!dispatch) {
    throw new Error("useEditorCommands must be used within EditorStoreProvider");
  }
  return dispatch;
}

function createDispatchAction(
  dispatch: React.Dispatch<EditorAction>,
  action: EditorAction
): void {
  dispatch(action);
}

export function EditorStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(editorReducer, undefined, createInitialEditorState);

  const commands = useMemo<EditorCommands>(() => {
    return {
      hydrateProject: (data) =>
        createDispatchAction(dispatch, { type: "hydrate-project", payload: data }),
      sendModeEvent: (event) =>
        createDispatchAction(dispatch, { type: "send-mode-event", payload: { event } }),
      setSelectedArea: (areaId) =>
        createDispatchAction(dispatch, { type: "set-selected-area", payload: { areaId } }),
      setSelectedTrack: (trackId) =>
        createDispatchAction(dispatch, { type: "set-selected-track", payload: { trackId } }),
      createArea: () => createDispatchAction(dispatch, { type: "create-area" }),
      insertVertexBetween: (index) =>
        createDispatchAction(dispatch, {
          type: "insert-vertex-between",
          payload: { index },
        }),
      removeVertexFromSelectedArea: (index) =>
        createDispatchAction(dispatch, {
          type: "remove-vertex-from-selected-area",
          payload: { index },
        }),
      deleteSelectedArea: () => createDispatchAction(dispatch, { type: "delete-selected-area" }),
      updateSelectedAreaLua: (callback) =>
        createDispatchAction(dispatch, {
          type: "update-selected-area-lua",
          payload: { callback },
        }),
      addSelectedAreaUparea: (uparea) =>
        createDispatchAction(dispatch, {
          type: "add-selected-area-uparea",
          payload: { uparea },
        }),
      removeSelectedAreaUparea: (uparea) =>
        createDispatchAction(dispatch, {
          type: "remove-selected-area-uparea",
          payload: { uparea },
        }),
      setSelectedAreaLeftVertex: (vertexId) =>
        createDispatchAction(dispatch, {
          type: "set-selected-area-left-vertex",
          payload: { vertexId },
        }),
      createTrack: (trackId) =>
        createDispatchAction(dispatch, {
          type: "create-track",
          payload: { trackId },
        }),
      deleteSelectedTrack: () =>
        createDispatchAction(dispatch, { type: "delete-selected-track" }),
      addSelectedAreaToTrack: () =>
        createDispatchAction(dispatch, { type: "add-selected-area-to-track" }),
      clearSelectedTrack: () =>
        createDispatchAction(dispatch, { type: "clear-selected-track" }),
      cycleTrackFlag: (index) =>
        createDispatchAction(dispatch, {
          type: "cycle-track-flag",
          payload: { index },
        }),
      removeTrackArea: (index) =>
        createDispatchAction(dispatch, {
          type: "remove-track-area",
          payload: { index },
        }),
      stagePointerMove: (point, dragging) =>
        createDispatchAction(dispatch, {
          type: "stage-pointer-move",
          payload: { point, dragging },
        }),
      stagePrimaryDown: (point, shiftKey) =>
        createDispatchAction(dispatch, {
          type: "stage-primary-down",
          payload: { point, shiftKey },
        }),
      stageSecondaryDown: () =>
        createDispatchAction(dispatch, { type: "stage-secondary-down" }),
      stagePrimaryUp: (ctrlKey) =>
        createDispatchAction(dispatch, {
          type: "stage-primary-up",
          payload: { ctrlKey },
        }),
    };
  }, [dispatch]);

  return (
    <EditorStateContext.Provider value={state}>
      <EditorDispatchContext.Provider value={dispatch}>
        <EditorCommandsContext.Provider value={commands}>
          {children}
        </EditorCommandsContext.Provider>
      </EditorDispatchContext.Provider>
    </EditorStateContext.Provider>
  );
}

export function useEditorSelector<T>(selector: (state: EditorState) => T): T {
  const state = useEditorStateContext();
  return selector(state);
}

export function useEditorDispatch(): React.Dispatch<EditorAction> {
  return useEditorDispatchContext();
}

export function useEditorCommands(): EditorCommands {
  const commands = useContext(EditorCommandsContext);
  if (!commands) {
    throw new Error("useEditorCommands must be used within EditorStoreProvider");
  }
  return commands;
}
