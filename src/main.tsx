import { enableMapSet } from "immer";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { EditorStoreProvider } from "./store/EditorStore";
import "./main.css";

enableMapSet();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <EditorStoreProvider>
      <App />
    </EditorStoreProvider>
  </React.StrictMode>
);
