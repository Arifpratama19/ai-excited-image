# A whale breaching through a library ceiling into the stars

[![ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/Arifpratama19/ai-excited-image/rank.svg)](https://make.fun/bounty/ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/Arifpratama19/ai-excited-image/reward.svg)](https://make.fun/bounty/ai-excited-01)

An entry for make.fun's **Make the AI judge excited** (ai-excited-01).

## The image

A colossal blue whale breaching through the shattered ceiling of a quiet
old library into a starry night sky. Books spiral through the air around
it, and a small child on a tall wooden ladder reaches up toward the whale
in wonder. Warm lamplight below, deep blue night above — one impossible
moment, frozen at its most thrilling.

The surprise is the scale: the largest animal on Earth where it could
never belong, in the quietest room imaginable. That is the jolt.

## How it works

`main.ts` (Node 22) validates the image and copies it to
`/output/entry.png`:

- must start with the JPEG SOI marker (`0xFFD8`) and end with the EOI
  marker (`0xFFD9`) — a whole JPEG, not truncated
- at most 1 MiB (1048576 bytes)
- at most 1024 by 1024 pixels (dimensions read from the first
  Start-Of-Frame marker)

Run it:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

It is deterministic: two runs write byte-identical output.

## Files

- `entry.png` — the image (JPEG bytes, 1024×1024)
- `main.ts` — the entry program
- `LICENSE` — MIT
