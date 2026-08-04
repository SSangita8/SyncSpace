import { useRef } from "react";
import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";

import { createYDoc } from "./yjs";

function CodeEditor({ roomId }) {
  const bindingRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const COLORS = [
    "#f94144",
    "#f3722c",
    "#f8961e",
    "#90be6d",
    "#43aa8b",
    "#577590",
    "#277da1",
    "#9b5de5",
    "#ff006e",
    "#00bbf9",
    "#2d3250",
    "#676f9d",
  ];

  const getUserColor = (id) => {
    let hash = 0;

    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    return COLORS[Math.abs(hash) % COLORS.length];
  };

  const handleEditorDidMount = (editor) => {
    const model = editor.getModel();

    if (!model) return;

    bindingRef.current?.destroy();

    const { text, awareness } = createYDoc(roomId);

    bindingRef.current = new MonacoBinding(
      text,
      model,
      new Set([editor]),
      awareness,
    );
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      theme="vs-dark"
      onMount={handleEditorDidMount}
      options={{
        automaticLayout: true,
        minimap: {
          enabled: false,
        },
        fontSize: 15,
        wordWrap: "on",
      }}
    />
  );
}

export default CodeEditor;
