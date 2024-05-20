export default {
  debug: (type, msg, meta) => {
    if (meta) {
      console.log("[" + type + "]", msg, meta);
    } else {
      console.log("[" + type + "]", msg);
    }
  },
  log: (type, msg, meta) => {
    if (meta) {
      console.log("[" + type + "]", msg, meta);
    } else {
      console.log("[" + type + "]", msg);
    }
  },
  error: (type, msg, meta) => {
    if (meta) {
      console.error("[" + type + "]", msg, meta);
    } else {
      console.error("[" + type + "]", msg);
    }
  },
}