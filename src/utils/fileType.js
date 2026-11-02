// File-type detection by magic bytes — never trust the client-sent mimetype.
// A renamed .exe with "image/png" mimetype is still caught here.
function bytes(buf, offset, hex) {
  return buf.subarray(offset, offset + hex.length / 2).toString("hex") === hex.toLowerCase();
}

export function detectFileKind(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // Images
  if (bytes(buffer, 0, "ffd8ff")) return { kind: "image", format: "jpg" };
  if (bytes(buffer, 0, "89504e47")) return { kind: "image", format: "png" };
  if (bytes(buffer, 0, "47494638")) return { kind: "image", format: "gif" };
  if (bytes(buffer, 0, "52494646") && bytes(buffer, 8, "57454250")) {
    return { kind: "image", format: "webp" };
  }
  // Video (mp4/mov — "ftyp" box at offset 4)
  if (bytes(buffer, 4, "66747970")) return { kind: "video", format: "mp4" };
  // Documents
  if (bytes(buffer, 0, "25504446")) return { kind: "document", format: "pdf" };

  return null;
}
