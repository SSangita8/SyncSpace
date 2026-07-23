import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Whiteboard from "../components/Whiteboard";
import CodeEditor from "../components/CodeEditor";

function Room() {
  const navigate = useNavigate();

  const { roomId } = useParams();

  const [activeTool, setActiveTool] = useState("select");

  const [code, setCode] = useState(
    `function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("SyncSpace"));`,
  );

  const leaveRoom = () => {
    navigate("/dashboard");
  };

  return (
    <div className="room-page">
      {/* ROOM HEADER */}

      <header className="room-header">
        <div className="room-title">
          <h1>SyncSpace</h1>

          <span className="room-id">Room ID: {roomId}</span>
        </div>

        <div className="room-actions">
          <div className="online-users">
            <span className="online-dot"></span>

            <span>1 user online</span>
          </div>

          <button className="leave-room-button" onClick={leaveRoom}>
            Leave Room
          </button>
        </div>
      </header>

      {/* SPLIT SCREEN */}

      <main className="workspace">
        {/* WHITEBOARD */}

        <section className="whiteboard-panel">
          <div className="panel-header">
            <h2>Whiteboard</h2>

            <div className="whiteboard-tools">
              <button
                className={activeTool === "select" ? "active-tool" : ""}
                onClick={() => setActiveTool("select")}
              >
                Select
              </button>

              <button
                className={activeTool === "pen" ? "active-tool" : ""}
                onClick={() => setActiveTool("pen")}
              >
                Pen
              </button>

              <button
                className={activeTool === "rectangle" ? "active-tool" : ""}
                onClick={() => setActiveTool("rectangle")}
              >
                Rectangle
              </button>

              <button
                className={activeTool === "circle" ? "active-tool" : ""}
                onClick={() => setActiveTool("circle")}
              >
                Circle
              </button>

              <button onClick={() => setActiveTool("text")}>Text</button>
            </div>
          </div>

          <div className="whiteboard-container">
            <Whiteboard activeTool={activeTool} />
          </div>
        </section>

        {/* CODE EDITOR */}

        <section className="editor-panel">
          <div className="panel-header">
            <h2>Code Editor</h2>

            <span className="language-label">JavaScript</span>
          </div>

          <div className="editor-container">
            <CodeEditor code={code} setCode={setCode} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Room;
