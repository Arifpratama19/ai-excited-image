// Entry program for make.fun ai-excited-01: "Make the AI judge excited".
// Copies the entry image (entry.png, a JPEG) to /output/entry.png after
// validating it is a whole JPEG within the competition's limits.
//
// The image: a colossal blue whale breaching through the shattered ceiling
// of a quiet old library into a starry night sky, books spiralling, a child
// on a ladder reaching up. Generated fresh for this entry.
//
// Runs with Node 22 type-stripping (erasable syntax only, no enums or
// namespaces). Deterministic: the output bytes are exactly the input bytes.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1048576;
const MAX_SIDE = 1024;

function fail(message: string): never {
  throw new Error("entry image rejected: " + message);
}

// Read the JPEG dimensions from its first Start-Of-Frame marker.
// Returns [width, height]. Throws when no SOF marker is found.
function jpegSize(bytes: Buffer): [number, number] {
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = bytes[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    if (marker === 0xda) break; // start of scan: no SOF after this
    const length = bytes.readUInt16BE(i + 2);
    if (length < 2 || i + 2 + length > bytes.length) break;
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      const height = bytes.readUInt16BE(i + 5);
      const width = bytes.readUInt16BE(i + 7);
      return [width, height];
    }
    i += 2 + length;
  }
  fail("no JPEG start-of-frame marker found");
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, "entry.png");
  const outDir = process.env.MAKEFUN_OUTPUT_DIR?.trim() || "/output";
  const target = join(outDir, "entry.png");

  let bytes: Buffer;
  try {
    bytes = readFileSync(source);
  } catch {
    fail("cannot read " + source + " (is entry.png beside main.ts?)");
  }

  // Whole JPEG: starts with SOI, ends with EOI.
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    fail("not a JPEG (missing SOI marker 0xFFD8)");
  }
  if (bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
    fail("truncated JPEG (missing EOI marker 0xFFD9)");
  }
  if (bytes.length > MAX_BYTES) {
    fail("image is " + bytes.length + " bytes, over the 1 MiB limit");
  }

  const [width, height] = jpegSize(bytes);
  if (width > MAX_SIDE || height > MAX_SIDE) {
    fail("image is " + width + "x" + height + ", over the 1024x1024 limit");
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(target, bytes);
  console.log("wrote " + target + " (" + bytes.length + " bytes, " + width + "x" + height + ")");
}

main();
