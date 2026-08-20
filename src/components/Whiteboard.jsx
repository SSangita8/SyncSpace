import { useEffect, useRef, useState } from "react";

import {
  Stage,
  Layer,
  Line,
  Rect,
  Circle,
  Text,
  Arrow,
  Group,
} from "react-konva";

import socket from "../socket";

function Whiteboard({ activeTool, roomId, strokeColor, strokeWidth }) {
  const stageRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [shapes, setShapes] = useState([]);
  const [currentShape, setCurrentShape] = useState(null);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState({});
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

  useEffect(() => {
    const handleShapeDrawn = (shape) => {
      setShapes((prev) => [...prev, shape]);
    };

    socket.on("shape-drawn", handleShapeDrawn);

    return () => {
      socket.off("shape-drawn", handleShapeDrawn);
    };
  }, []);

  useEffect(() => {
    const handleCursorUpdate = (cursor) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [cursor.userId]: cursor,
      }));
    };

    socket.on("cursor-update", handleCursorUpdate);

    socket.on("user-left", ({ socketId }) => {
      setRemoteCursors((prev) => {
        const updated = { ...prev };

        delete updated[socketId];

        return updated;
      });
    });

    return () => {
      socket.off("cursor-update", handleCursorUpdate);
      socket.off("user-left");
    };
  }, []);

  const getPointerPosition = () => {
    return stageRef.current?.getPointerPosition();
  };

  // MOUSE DOWN

  const handleMouseDown = () => {
    const position = getPointerPosition();

    if (!position) return;

    // TEXT TOOL
    if (activeTool === "text") {
      const text = prompt("Enter text");

      if (!text) return;

      const newText = {
        id: `${socket.id}-${Date.now()}`,
        type: "text",
        x: position.x,
        y: position.y,
        text,
        stroke: strokeColor,
      };

      setShapes((prev) => [...prev, newText]);

      socket.emit("draw-shape", {
        roomId,
        shape: newText,
      });

      return;
    }

    setIsDrawing(true);

    switch (activeTool) {
      case "pen":
        setCurrentShape({
          type: "line",
          points: [position.x, position.y],
          stroke: strokeColor,
          strokeWidth,
        });
        break;

      case "rectangle":
        setCurrentShape({
          type: "rect",
          x: position.x,
          y: position.y,
          width: 0,
          height: 0,
          stroke: strokeColor,
          strokeWidth,
        });
        break;

      case "circle":
        setCurrentShape({
          type: "circle",
          x: position.x,
          y: position.y,
          radius: 0,
          stroke: strokeColor,
          strokeWidth,
        });
        break;

      case "line":
        setCurrentShape({
          type: "straight-line",
          points: [position.x, position.y, position.x, position.y],
          stroke: strokeColor,
          strokeWidth,
        });
        break;

      case "arrow":
        setCurrentShape({
          type: "arrow",
          points: [position.x, position.y, position.x, position.y],
          stroke: strokeColor,
          strokeWidth,
        });
        break;

      default:
        break;
    }
  };

  // MOUSE MOVE

  const handleMouseMove = () => {
    const position = getPointerPosition();

    if (!position) return;

    socket.emit("cursor-move", {
      roomId,
      userId: socket.id,
      name: user?.name || "Anonymous",
      color: getUserColor(socket.id),
      x: position.x,
      y: position.y,
    });

    if (!isDrawing) return;

    setCurrentShape((shape) => {
      if (!shape) return shape;

      switch (shape.type) {
        case "line":
          return {
            ...shape,
            points: [...shape.points, position.x, position.y],
          };

        case "rect":
          return {
            ...shape,
            width: position.x - shape.x,
            height: position.y - shape.y,
          };

        case "circle":
          const dx = position.x - shape.x;
          const dy = position.y - shape.y;

          return {
            ...shape,
            radius: Math.sqrt(dx * dx + dy * dy),
          };

        case "straight-line":
          return {
            ...shape,
            points: [shape.points[0], shape.points[1], position.x, position.y],
          };

        case "arrow":
          return {
            ...shape,
            points: [shape.points[0], shape.points[1], position.x, position.y],
          };

        default:
          return shape;
      }
    });
  };

  // MOUSE UP

  const handleMouseUp = () => {
    if (!isDrawing || !currentShape) return;

    const newShape = {
      ...currentShape,
      id: `${socket.id}-${Date.now()}`,
    };

    setShapes((prev) => [...prev, newShape]);

    socket.emit("draw-shape", {
      roomId,
      shape: newShape,
    });

    setCurrentShape(null);

    setIsDrawing(false);
  };

  const selectShape = (shapeId) => {
    if (activeTool !== "select") return;

    setSelectedShapeId(shapeId);
  };

  const eraseShape = (shapeId) => {
    if (activeTool !== "eraser") return;

    setShapes((previousShapes) =>
      previousShapes.filter((shape) => shape.id !== shapeId),
    );

    socket.emit("delete-shape", {
      roomId,
      shapeId,
    });
  };

  // RENDER SHAPE

  const renderShape = (shape, isCurrentShape = false) => {
    const stroke = isCurrentShape ? "#f9b17a" : shape.stroke || "#424769";

    const width = shape.strokeWidth || 3;

    switch (shape.type) {
      case "line":
        return (
          <Line
            key={shape.id}
            points={shape.points}
            stroke={stroke}
            strokeWidth={width}
            lineCap="round"
            lineJoin="round"
            tension={0}
          />
        );

      case "rect":
        return (
          <Rect
            key={shape.id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            stroke={stroke}
            strokeWidth={width}
          />
        );

      case "circle":
        return (
          <Circle
            key={shape.id}
            x={shape.x}
            y={shape.y}
            radius={shape.radius}
            stroke={stroke}
            strokeWidth={width}
          />
        );

      case "straight-line":
        return (
          <Line
            key={shape.id}
            points={shape.points}
            stroke={stroke}
            strokeWidth={width}
          />
        );

      case "arrow":
        return (
          <Arrow
            key={shape.id}
            points={shape.points}
            stroke={stroke}
            fill={stroke}
            strokeWidth={width}
            pointerLength={12}
            pointerWidth={12}
          />
        );

      case "text":
        return (
          <Text
            key={shape.id}
            x={shape.x}
            y={shape.y}
            text={shape.text}
            fill={stroke}
            fontSize={20}
            fontStyle="bold"
          />
        );

      default:
        return null;
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth / 2}
      height={window.innerHeight - 140}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Layer>
        {/* =========================
          SAVED SHAPES
      ========================== */}

        {shapes.map((shape) => (
          <Group key={shape.id}>{renderShape(shape)}</Group>
        ))}

        {/* =========================
          CURRENT SHAPE PREVIEW
      ========================== */}

        {currentShape && <Group>{renderShape(currentShape, true)}</Group>}

        {/* =========================
          REMOTE USER CURSORS
      ========================== */}

        {Object.values(remoteCursors).map((cursor) => (
          <Group key={cursor.userId}>
            {/* Cursor Dot */}

            <Circle
              x={cursor.x}
              y={cursor.y}
              radius={6}
              fill={cursor.color}
              shadowBlur={5}
            />

            {/* Cursor Name */}

            <Rect
              x={cursor.x + 10}
              y={cursor.y - 22}
              width={cursor.name.length * 8 + 10}
              height={22}
              fill={cursor.color}
              cornerRadius={6}
            />

            <Text
              x={cursor.x + 15}
              y={cursor.y - 18}
              text={cursor.name}
              fill="white"
              fontStyle="bold"
              fontSize={13}
            />
          </Group>
        ))}
      </Layer>
    </Stage>
  );
}

export default Whiteboard;
