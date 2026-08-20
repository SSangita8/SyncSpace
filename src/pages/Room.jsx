import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import socket from "../socket";

import Whiteboard from "../components/Whiteboard";
import CodeEditor from "../CodeEditor/CodeEditor";

function Room() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [activeTool, setActiveTool] = useState("select");
  const [strokeColor, setStrokeColor] = useState("#424769");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [onlineUsers, setOnlineUsers] = useState(1);

  // SOCKET.IO ROOM CONNECTION

  useEffect(() => {
    // Connect to Socket.io server

    socket.connect();

    // Join the current room

    socket.emit("join-room", roomId);

    // Listen for online user count

    const handleRoomUsers = (data) => {
      setOnlineUsers(data.count);
    };

    socket.on("room-users", handleRoomUsers);

    // Cleanup when leaving room

    return () => {
      socket.off("room-users", handleRoomUsers);

      socket.disconnect();
    };
  }, [roomId]);

  // LEAVE ROOM

  const leaveRoom = () => {
    socket.disconnect();

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

            <span>
              {onlineUsers} {onlineUsers === 1 ? "user" : "users"} online
            </span>
          </div>

          <button className="leave-room-button" onClick={leaveRoom}>
            Leave Room
          </button>
        </div>
      </header>

      {/* SPLIT SCREEN */}

      <main className="workspace">
        {/*WHITEBOARD */}

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
                className={activeTool === "line" ? "active-tool" : ""}
                onClick={() => setActiveTool("line")}
              >
                Line
              </button>

              <button
                className={activeTool === "arrow" ? "active-tool" : ""}
                onClick={() => setActiveTool("arrow")}
              >
                Arrow
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

              <button
                className={activeTool === "text" ? "active-tool" : ""}
                onClick={() => setActiveTool("text")}
              >
                Text
              </button>

              <button
                className={activeTool === "eraser" ? "active-tool" : ""}
                onClick={() => setActiveTool("eraser")}
              >
                Eraser
              </button>

              <div className="toolbar-divider" />

              <label></label>

              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
              />

              <label>Stroke</label>

              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
              />

              <button>↶ Undo</button>

              <button>↷ Redo</button>
            </div>
          </div>

          <div className="whiteboard-container">
            <Whiteboard
              roomId={roomId}
              activeTool={activeTool}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
            />
          </div>
        </section>

        {/* 
            CODE EDITOR
         */}

        <section className="editor-panel">
          <div className="panel-header">
            <h2>Code Editor</h2>

            <span className="language-label">JavaScript</span>
          </div>

          <div className="editor-container">
            <CodeEditor roomId={roomId} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Room;
