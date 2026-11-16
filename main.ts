// ai-excited-01 entry (Node 22, standard library only): the image is the
// entry.png beside this file, and this program writes it to /output/entry.png.
// The gate takes a whole PNG or JPEG of at most 1 MiB and 1024 by 1024 pixels,
// so before copying, the program validates the file: it must be a JPEG
// (SOI magic FF D8 FF), at most 1 MiB, and at most 1024 by 1024 pixels
// (dimensions read from the JPEG SOF marker), and it must end with the
// EOI marker (FF D9), so a truncated file is rejected instead of copied.
// The judge sees exactly the bytes written here, so the program copies
// the file byte for byte and does nothing else: run twice, it writes the
// same bytes twice.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1024 * 1024;
const MAX_DIMENSION = 1024;

function fail(message) {
  console.error(`entry: ${message}`);
  process.exit(1);
}

/** Read width and height from a JPEG buffer by scanning for the SOF marker. */
function jpegDimensions(image) {
  let offset = 2; // after the SOI marker (FF D8)
  while (offset + 3 < image.length) {
    if (image[offset] !== 0xff) fail('not a JPEG: bad marker prefix');
    // Skip 0xFF fill bytes: the marker is the first non-0xFF byte after them.
    let marker = image[offset + 1];
    while (marker === 0xff && offset + 2 < image.length) {
      offset++;
      marker = image[offset + 1];
    }
    if (marker === 0xd9) fail('not a JPEG: no SOF marker before EOI');
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      offset += 2; // standalone marker, no length field
      continue;
    }
    if (marker === 0xda) fail('not a JPEG: no SOF marker before scan data');
    const length = image.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > image.length) {
      fail('not a JPEG: truncated segment');
    }
    // SOF0-SOF15, except DHT (0xc4), JPG (0xc8) and DAC (0xcc).
    if (
      marker >= 0xc0 && marker <= 0xcf &&
      marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
    ) {
      if (length < 8) fail('not a JPEG: truncated SOF segment');
      const height = image.readUInt16BE(offset + 5);
      const width = image.readUInt16BE(offset + 7);
      return { width, height };
    }
    offset += 2 + length;
  }
  fail('not a JPEG: no SOF marker found');
}

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const image = readFileSync(join(here, 'entry.png'));

if (
  image.length < 3 ||
  image[0] !== 0xff || image[1] !== 0xd8 || image[2] !== 0xff
) {
  fail('not a JPEG: missing SOI magic bytes');
}
if (image.length > MAX_BYTES) {
  fail(`image is ${image.length} bytes, over the 1 MiB limit`);
}
const { width, height } = jpegDimensions(image);
if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
  fail(`image is ${width}x${height}, over the 1024x1024 limit`);
}
if (
  image[image.length - 2] !== 0xff || image[image.length - 1] !== 0xd9
) {
  fail('not a JPEG: missing EOI marker, file looks truncated');
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), image);
