Inflect Image Viewer

Overview

This folder contains a small interactive image viewer used by the Inflect site.
It supports:
- Single-image viewing with pan/zoom and a rotation control.
- Multi-layer composition where multiple images are drawn together with per-layer parameters (opacity, rotation, anchor/offset, scale).
- Annotation boxes and lines encoded in the URL hash.

Files

- `index.html` - The image viewer. Client-side JavaScript handles parsing the URL hash, loading images into Image objects, and drawing them to a canvas.

Hash format and behavior

The viewer is primarily driven by `location.hash`. The hash uses ampersand-separated fields. The canonical form is:

  viewPart & opacity & boxes & lines & urlField & rotation

- viewPart: either empty, `poster`, `cover`, or a comma-separated rectangle `x1,y1,x2,y2` (used for setting the view in image coordinates).
- opacity: integer 0..100 representing the overall image opacity.
- boxes: comma-separated numbers grouped by fours (x1,y1,x2,y2) for box annotations.
- lines: comma-separated numbers grouped by fours (x1,y1,x2,y2) for line annotations.
- urlField: either a single image URL (legacy) or a pipe-separated list of layer tokens.
- rotation: trailing numeric rotation in degrees. For backward compatibility, the parser tolerates short hashes where the rotation ended up in the `url` slot.

Layer syntax (urlField)

The `urlField` supports multiple layers joined by `|`. Each layer token looks like:

  encodeURIComponent(url)[@k=v@k2=v2...]

Allowed per-layer params (after `@`):
- `o` — opacity (0..100). Default: 100
- `r` — rotation in degrees. Default: 0
- `x` — anchor x (normalized 0..1). Default: 0.5
- `y` — anchor y (normalized 0..1). Default: 0.5
- `s` — scale (multiplier). Default: 1

Example single-layer hash:

  #&&&/img/cover.png&45

This short form will be parsed as: url `/img/cover.png` and trailing rotation 45 degrees.

Example multi-layer hash:

  #&&&/img/cover.png|/img/logos.png@o=60@r=10&

This loads two layers; the second layer has opacity 60 and rotation 10 degrees.

Behavior notes and design choices

- Tolerant parsing: The viewer will detect common short/legacy hash shapes and shift fields so the `url` and `rotation` are recovered correctly (for example, when the rotation token ends up in the URL slot or when the url token lands in the `lines` slot due to missing trailing fields).
- Layer merging: When the hash changes and the set of parsed layer URLs is a subset of currently loaded layers (same URLs but shorter token list), the viewer merges parameters into existing layers and preserves loaded Image objects. This prevents transient hash updates from dropping layers unexpectedly.
- Rotation handling: A trailing rotation is applied to the top-most layer when layers exist (this is persisted by UI interactions into per-layer `r=` params). For the legacy single-image path (no layers array), the rotation is kept as a trailing rotation in the hash.
- Hash writes: The viewer avoids rewriting the hash from inside the hashchange handler (to avoid re-entry loops and encoding/order mismatches); interactive user actions persist into the hash.

Running headless tests

A small Puppeteer-based test harness exists at `img/tests/run-headless-tests.js` and a `test:headless` script was added to the repository's `package.json`. The tests run a local static server and exercise several viewer behaviors (short-form rotation, layer merge/merge-by-url). They are designed to wait for `layers` and `layer.loaded` flags before asserting.

To run locally:

  npm run test:headless

Notes / Next steps

- The debug logging in `img/index.html` was reduced to essential warnings. If you'd like a debug-mode toggle, I can add a small `window.IMG_DEBUG` global to enable verbose logs during development.
- A layers UI panel (add/remove/reorder layers) is not implemented yet; I can add it next if you want interactive layer editing.

License / Attribution

See the repository LICENSE for licensing details.
