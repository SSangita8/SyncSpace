import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import socket from "../socket";

export function createYDoc(roomId, user) {
  // =========================
  // CREATE YJS DOCUMENT
  // =========================

  const doc = new Y.Doc();

  // Shared text used by Monaco
  const text = doc.getText("code");

  // Awareness instance
  const awareness = new Awareness(doc);

  // =========================
  // SET CURRENT USER
  // =========================

  awareness.setLocalStateField("user", {
    id: user.id,
    name: user.name,
    color: user.color,
  });

  // =========================
  // REMOVE OLD LISTENERS
  // =========================

  socket.off("yjs-update");
  socket.off("awareness-update");

  // =========================
  // SEND DOCUMENT UPDATES
  // =========================

  doc.on("update", (update) => {
    socket.emit("yjs-update", {
      roomId,
      update: Array.from(update),
    });
  });

  // =========================
  // RECEIVE DOCUMENT UPDATES
  // =========================

  socket.on("yjs-update", (update) => {
    Y.applyUpdate(doc, Uint8Array.from(update));
  });

  // =========================
  // SEND AWARENESS
  // =========================

  awareness.on("update", () => {
    socket.emit("awareness-update", {
      roomId,
      state: awareness.getLocalState(),
    });
  });

  // =========================
  // RECEIVE AWARENESS
  // =========================

  socket.on("awareness-update", ({ clientId, state }) => {
    awareness.setLocalStateField(clientId, state);
  });

  // =========================
  // RETURN
  // =========================

  return {
    doc,
    text,
    awareness,
  };
}
