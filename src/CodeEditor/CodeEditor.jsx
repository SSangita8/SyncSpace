import "./editor.css";
import { useState } from "react";
import Editor from "@monaco-editor/react";

import { LANGUAGES } from "../constants/languages";
import { DEFAULT_CODE } from "../constants/defaultCode";
import { runCode } from "../services/judge0";

function CodeEditor() {
  
  // STATE

  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);

  const [code, setCode] = useState(DEFAULT_CODE[LANGUAGES[0].monaco]);

  const [output, setOutput] = useState("");

  const [running, setRunning] = useState(false);

  // LANGUAGE CHANGE
  
  const handleLanguageChange = (event) => {
    const language = LANGUAGES.find(
      (lang) => lang.id === Number(event.target.value),
    );

    setSelectedLanguage(language);

    setCode(DEFAULT_CODE[language.monaco]);
  };

  
  // RUN CODE
  

  const handleRunCode = async () => {
    setRunning(true);
    setOutput("Running...");

    try {
      const result = await runCode(code, selectedLanguage.id);

      if (result.stdout) {
        setOutput(result.stdout);
      } else if (result.stderr) {
        setOutput(result.stderr);
      } else if (result.compile_output) {
        setOutput(result.compile_output);
      } else if (result.message) {
        setOutput(result.message);
      } else {
        setOutput("No output.");
      }
    } catch (error) {
      console.error(error);
      setOutput("Something went wrong while executing the code.");
    }

    setRunning(false);
  };

  // UI

  return (
    <div className="code-editor-container">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <select value={selectedLanguage.id} onChange={handleLanguageChange}>
          {LANGUAGES.map((language) => (
            <option key={language.id} value={language.id}>
              {language.name}
            </option>
          ))}
        </select>

        <button
          className="run-button"
          onClick={handleRunCode}
          disabled={running}
        >
          {running ? "Running..." : "▶ Run Code"}
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="editor-area">
        <Editor
          height="100%"
          language={selectedLanguage.monaco}
          value={code}
          theme="vs-dark"
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: {
              enabled: false,
            },
            automaticLayout: true,
            fontSize: 15,
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
        />
      </div>

      {/* Output */}
      <div className="output-panel">
        <div className="output-title">Output</div>

        <pre className="output-console">
          {output || "Run your program to see the output..."}
        </pre>
      </div>
    </div>
  );
}

export default CodeEditor;
