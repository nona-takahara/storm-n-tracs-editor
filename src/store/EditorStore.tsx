import React, { createContext, useContext, useRef, useSyncExternalStore } from "react";
import Vector2d from "../data/Vector2d";
import { EditModeEvent } from "../domain/editor/editModeMachine";
import { EditorAction, editorReducer } from "./editorReducer";
import { createInitialEditorState, EditorState, LoadedProjectData } from "./editorTypes";

// UI から利用する高レベル操作コマンド群。
interface EditorCommands {
  hydrateProject: (data: LoadedProjectData) => void;
  sendModeEvent: (event: EditModeEvent) => void;
  setSelectedArea: (areaId: string | undefined) => void;
  setSelectedTrack: (trackId: string | undefined) => void;
  setTrackChainSelectEnabled: (enabled: boolean) => void;
  setPreviewArea: (areaId: string | undefined) => void;
  setPreviewTrack: (trackId: string | undefined) => void;
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
  appendAreaToSelectedTrackById: (areaId: string) => void;
  clearSelectedTrack: () => void;
  removeTrackArea: (index: number) => void;
  moveTrackArea: (fromIndex: number, toIndex: number) => void;
  stagePointerMove: (point: Vector2d, dragging: boolean) => void;
  stagePrimaryDown: (point: Vector2d, shiftKey: boolean) => void;
  stageSecondaryDown: () => void;
  stagePrimaryUp: (ctrlKey: boolean) => void;
}

// ストア本体が提供する低レベル API。
interface EditorStoreApi {
  getState: () => EditorState;
  dispatch: React.Dispatch<EditorAction>;
  subscribe: (listener: () => void) => () => void;
  commands: EditorCommands;
}

// ストア共有用の React Context。
const EditorStoreContext = createContext<EditorStoreApi | undefined>(undefined);

// reducer ベースの簡易 external store を作成する。
function createEditorStore(initialState = createInitialEditorState()): EditorStoreApi {
  let state = initialState;
  const listeners = new Set<() => void>();

  // 現在状態の参照取得。
  const getState = () => state;

  // 変更通知購読。返り値で購読解除できる。
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  // reducer 実行後、状態変化があれば購読者へ通知する。
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

  // よく使う action dispatch を呼び出しやすいコマンドへ束ねる。
  const commands: EditorCommands = {
    hydrateProject: (data) => createDispatchAction(dispatch, { type: "hydrate-project", payload: data }),
    sendModeEvent: (event) =>
      createDispatchAction(dispatch, { type: "send-mode-event", payload: { event } }),
    setSelectedArea: (areaId) =>
      createDispatchAction(dispatch, { type: "set-selected-area", payload: { areaId } }),
    setSelectedTrack: (trackId) =>
      createDispatchAction(dispatch, { type: "set-selected-track", payload: { trackId } }),
    setTrackChainSelectEnabled: (enabled) =>
      createDispatchAction(dispatch, {
        type: "set-track-chain-select-enabled",
        payload: { enabled },
      }),
    setPreviewArea: (areaId) =>
      createDispatchAction(dispatch, {
        type: "set-preview-area",
        payload: { areaId },
      }),
    setPreviewTrack: (trackId) =>
      createDispatchAction(dispatch, {
        type: "set-preview-track",
        payload: { trackId },
      }),
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
    appendAreaToSelectedTrackById: (areaId) =>
      createDispatchAction(dispatch, {
        type: "append-area-to-selected-track-by-id",
        payload: { areaId },
      }),
    clearSelectedTrack: () =>
      createDispatchAction(dispatch, { type: "clear-selected-track" }),
    removeTrackArea: (index) =>
      createDispatchAction(dispatch, {
        type: "remove-track-area",
        payload: { index },
      }),
    moveTrackArea: (fromIndex, toIndex) =>
      createDispatchAction(dispatch, {
        type: "move-track-area",
        payload: { fromIndex, toIndex },
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

// dispatch 呼び出しを共通化し、commands 側の記述を揃える。
function createDispatchAction(
  dispatch: React.Dispatch<EditorAction>,
  action: EditorAction
): void {
  dispatch(action);
}

// EditorStore をコンポーネントツリーへ供給する Provider。
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

// selector 経由で EditorState の一部を購読する。
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

// 生の dispatch 関数を取得する。
export function useEditorDispatch(): React.Dispatch<EditorAction> {
  const store = useContext(EditorStoreContext);
  if (!store) {
    throw new Error("useEditorDispatch must be used within EditorStoreProvider");
  }
  return store.dispatch;
}

// 高レベルの編集コマンド群を取得する。
export function useEditorCommands(): EditorCommands {
  const store = useContext(EditorStoreContext);
  if (!store) {
    throw new Error("useEditorCommands must be used within EditorStoreProvider");
  }
  return store.commands;
}
