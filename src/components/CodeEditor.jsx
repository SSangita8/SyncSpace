import Editor from "@monaco-editor/react";

function CodeEditor({ code, setCode }) {
  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      theme="vs-dark"
      value={code}
      onChange={(value) => setCode(value || "")}
      options={{
        minimap: {
          enabled: false,
        },

        fontSize: 15,

        automaticLayout: true,

        wordWrap: "on",

        padding: {
          top: 20,
        },
      }}
    />
  );
}

export default CodeEditor;
