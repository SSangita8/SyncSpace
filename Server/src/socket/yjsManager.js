const Y = require("yjs");

const docs = new Map();

function getYDoc(roomId) {
  if (!docs.has(roomId)) {
    const doc = new Y.Doc();

    docs.set(roomId, doc);
  }

  return docs.get(roomId);
}

module.exports = {
  getYDoc,
};
