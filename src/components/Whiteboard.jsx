import { useEffect, useRef, useState } from "react";

import { Stage, Layer, Line, Rect, Circle } from "react-konva";

import socket from "../socket";

function Whiteboard({ activeTool, roomId }) {
  const stageRef = useRef(null);

  const [shapes, setShapes] = useState([]);

  const [isDrawing, setIsDrawing] = useState(false);

  const [currentShape, setCurrentShape] = useState(null);

  // =========================
  // RECEIVE REMOTE SHAPES
  // =========================

  useEffect(() => {
    const handleShapeDrawn = (shape) => {
      setShapes((previousShapes) => [...previousShapes, shape]);
    };

    socket.on("shape-drawn", handleShapeDrawn);

    return () => {
      socket.off("shape-drawn", handleShapeDrawn);
    };
  }, []);

  // =========================
  // GET POINTER POSITION
  // =========================

  const getPointerPosition = () => {
    const stage = stageRef.current;

    return stage.getPointerPosition();
  };

  // =========================
  // MOUSE DOWN
  // =========================

  const handleMouseDown = () => {
    const position = getPointerPosition();

    if (!position) {
      return;
    }

    if (activeTool === "pen") {
      setIsDrawing(true);

      setCurrentShape({
        type: "line",

        points: [position.x, position.y],
      });
    }

    if (activeTool === "rectangle") {
      setIsDrawing(true);

      setCurrentShape({
        type: "rect",

        x: position.x,

        y: position.y,

        width: 0,

        height: 0,
      });
    }

    if (activeTool === "circle") {
      setIsDrawing(true);

      setCurrentShape({
        type: "circle",

        x: position.x,

        y: position.y,

        radius: 0,
      });
    }
  };

  // =========================
  // MOUSE MOVE
  // =========================

  const handleMouseMove = () => {
    if (!isDrawing) {
      return;
    }

    const position = getPointerPosition();

    if (!position) {
      return;
    }

    setCurrentShape((shape) => {
      if (!shape) {
        return shape;
      }

      // FREEHAND LINE

      if (shape.type === "line") {
        return {
          ...shape,

          points: [...shape.points, position.x, position.y],
        };
      }

      // RECTANGLE

      if (shape.type === "rect") {
        return {
          ...shape,

          width: position.x - shape.x,

          height: position.y - shape.y,
        };
      }

      // CIRCLE

      if (shape.type === "circle") {
        const dx = position.x - shape.x;

        const dy = position.y - shape.y;

        const radius = Math.sqrt(dx * dx + dy * dy);

        return {
          ...shape,

          radius,
        };
      }

      return shape;
    });
  };

  // =========================
  // MOUSE UP
  // =========================

  const handleMouseUp = () => {
    if (!isDrawing) {
      return;
    }

    if (!currentShape) {
      return;
    }

    const newShape = {
      ...currentShape,

      id: `${socket.id}-${Date.now()}`,
    };

    // Add shape locally

    setShapes((previousShapes) => [...previousShapes, newShape]);

    // Send shape to other users

    socket.emit("draw-shape", {
      roomId,

      shape: newShape,
    });

    setCurrentShape(null);

    setIsDrawing(false);
  };

  // =========================
  // RENDER SHAPE
  // =========================

  const renderShape = (shape, isCurrentShape = false) => {
    const stroke = isCurrentShape ? "#f9b17a" : "#424769";

    if (shape.type === "line") {
      return (
        <Line
          key={shape.id}
          points={shape.points}
          stroke={stroke}
          strokeWidth={3}
          lineCap="round"
          lineJoin="round"
        />
      );
    }

    if (shape.type === "rect") {
      return (
        <Rect
          key={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          stroke={stroke}
          strokeWidth={3}
        />
      );
    }

    if (shape.type === "circle") {
      return (
        <Circle
          key={shape.id}
          x={shape.x}
          y={shape.y}
          radius={shape.radius}
          stroke={stroke}
          strokeWidth={3}
        />
      );
    }

    return null;
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
        {/* REMOTE + COMPLETED SHAPES */}

        {shapes.map((shape) => renderShape(shape))}

        {/* CURRENTLY DRAWING SHAPE */}

        {currentShape && renderShape(currentShape, true)}
      </Layer>
    </Stage>
  );
}

export default Whiteboard;
