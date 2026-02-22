import React, { createContext, useContext, useRef, useSyncExternalStore } from "react";
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

interface EditorStoreApi {
  getState: () => EditorState;
  dispatch: React.Dispatch<EditorAction>;
  subscribe: (listener: () => void) => () => void;
  commands: EditorCommands;
}

const EditorStoreContext = createContext<EditorStoreApi | undefined>(undefined);

function createEditorStore(initialState = createInitialEditorState()): EditorStoreApi {
  let state = initialState;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const dispatch: React.Dispatch<EditorAction> = (action) => {
    const nextState = editorReducer(state, action);
    if (nextState === state) {
      return;
    }
    state = nextState;
    listeners.forEach((listener) => {
      listener();
    });
  };

  const commands: EditorCommands = {
    hydrateProject: (data) => createDispatchAction(dispatch, { type: "hydrate-project", payload: data }),
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

  return {
    getState,
    dispatch,
    subscribe,
    commands,
  };
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
  const storeRef = useRef<EditorStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createEditorStore();
  }

  const store = storeRef.current;
  if (!store) {
    throw new Error("failed to initialize editor store");
  }

  return (
    <EditorStoreContext.Provider value={store}>{children}</EditorStoreContext.Provider>
  );
}

export function useEditorSelector<T>(selector: (state: EditorState) => T): T {
  const store = useContext(EditorStoreContext);
  if (!store) {
    throw new Error("useEditorSelector must be used within EditorStoreProvider");
  }

  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState())
  );
}

export function useEditorDispatch(): React.Dispatch<EditorAction> {
  const store = useContext(EditorStoreContext);
  if (!store) {
    throw new Error("useEditorDispatch must be used within EditorStoreProvider");
  }
  return store.dispatch;
}

export function useEditorCommands(): EditorCommands {
  const store = useContext(EditorStoreContext);
  if (!store) {
    throw new Error("useEditorCommands must be used within EditorStoreProvider");
  }
  return store.commands;
}
