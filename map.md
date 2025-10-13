# Map (map.html) — Interactive mapping tutorial

[](map/#23.99000,29.92877,2.00,0.0,0.0/~Gaza_border_dash,~Gaza_border_base)
This document explains how to use the interactive map at `map/index.html`. It covers the hash-driven controls, toggling layers, loading dynamic GeoJSON files, the FreeCamera "follow" animation, and the layer UI. Read this to learn how to build, debug and embed views using the map’s features.


Example URL (camera + visible layers):

`map/#lat,lng,zoom,bearing,pitch/+layerA,~layerB`

Example with camera animation animation:

[map/#31.52888,34.47937,18.14,15.0,0/](map/#31.41976,34.39009,10.00,37.6,0.0/)


Adding two layers:

[map/#31.52888,34.47937,18.14,15.0,0/+jabalia,+rafah](map/#31.41976,34.39009,10.00,37.6,0.0/+jabalia,+rafah)


Removing a layer:
[map/#31.43315,34.35321,10.06,37.6,0.0/~satellite](map/#31.43315,34.35321,10.06,37.6,0.0/~satellite)


Adding a custom satellite overlay:
[http://127.0.0.1:5500/map/#31.52374,34.43343,15.00,37.6,0.0/~satellite,+overlay](http://127.0.0.1:5500/map/#31.52374,34.43343,15.00,37.6,0.0/+overlay)


To reset the default layer visibility simply remove their custom mentions:
[map/#31.51448,34.44919,12.64,37.6,0.0](map/#31.51448,34.44919,12.64,37.6,0.0)


So far we've only played with camera movements and layer visibility from the existing Mapbox style. But we can also use the same syntax to load external geojson layers. For example this path from Jabalia to Rafah:
[map/#31.43672,34.34664,10.16,37.6,0.0/+jabalia-rafah](map/#31.43672,34.34664,10.16,37.6,0.0/+jabalia-rafah)

Simply place a `filename.geojson` in the `/map` directory and load it using the add layer synatax `+filename`.

From that point on it can be shown and hidden like any other layer.

<!-- 
We can add a custom style to the new layer by noting which source layer should it look like. For example, we can use the hidden `track` layer as a source like this: `+filename(source)`:
[map/#31.43672,34.34664,10.16,37.6,0.0/+jabalia-rafah(track)](map/#31.43672,34.34664,10.16,37.6,0.0/+jabalia-rafah(track))
 -->

With externally loaded paths we can even animate the camera to follow the path by adding the `:follow` syntax:
[map/#31.52090,34.47332,14.00,19.2,48.5/+jabalia-rafah:follow](map/#31.52090,34.47332,14.00,19.2,48.5/+jabalia-rafah:follow)


## TBC…

<!-- 
## Quick start

- Open `map/index.html` in a browser (or `map/` served from a local web server).
- The map reads options from the URL hash and updates the view accordingly.
- Use the controls in the top-left to toggle layers or delete dynamic layers.


Notes on notation:
- `+id` means explicitly show layer `id` (add or reveal it).
- `~id` means explicitly hide layer `id` (keep hidden/un-checked).
- Appending `:follow` to a `+id` or `~id` (for example `+myline:follow`) instructs the map to start the follow animation for that layer after it loads.

---

## Hash syntax and behaviors

The map's hash format is flexible and designed for shareable URLs. It follows this structure:

`#{camera-part}/{layer-toggles}`

camera-part: `lat,lng,zoom,bearing,pitch`

layer-toggles: comma-separated tokens, where each token is one of:
- `+layerId` — ensure `layerId` is visible (if it's dynamic, load it).
- `~layerId` — explicitly hide `layerId` (useful to keep dynamic layers loaded but hidden).
- `+layerId:follow` — load and then follow this layer's geometry with the FreeCamera.

Rules and notes:
- If a dynamic GeoJSON filename (e.g. `roads.geojson`) is mentioned with `+roads`, the map will attempt to load `roads.geojson` from the `map/` directory.
- When multiple layers are listed, the map will set visibility according to the explicit tokens and remove any previously added dynamic layers that are not present as `+` tokens.
- `:follow` is intended to be a temporary instruction; the map will not automatically remove it from the hash in all configurations. (This allows parent frames, UIs or users to decide when to stop following.)

---

## UI controls (top-left panel)

- Checkboxes reflect explicit toggles in the hash and the style defaults.
- Clicking a checkbox toggles explicit `+`/`~` state in the hash and updates visibility.
- Dynamic layers (loaded from `.geojson`) get a small delete `x` button so you can remove the layer from the map and the UI.

Behavioral details:
- The UI reads the hash to determine which checkboxes should be bold (explicitly set) vs. default.
- Reset buttons (↻) restore a style layer to its style default visibility.

---

## Dynamic GeoJSON loading

Use `+filename` in the hash to ask the map to load `filename.geojson`. The loader will:

1. fetch `filename.geojson`
2. add a source and a basic layer (line/fill/circle depending on geometry)
3. set visibility according to `+` or `~` token

Examples:

`#31.5,34.4,12,0,0/+myroute` — loads `myroute.geojson` and shows it.

`#31.5,34.4,12,0,0/~myroute` — loads `myroute.geojson` but keeps it hidden.

If a GeoJSON is requested but the source already exists, the code replaces the source data and updates the layer.

---

## Follow animation (FreeCamera)

Purpose: animate the camera so it follows the "tip" of a LineString while keeping a stable view. The map implements a smooth camera follow optimized for usability:

- The follow instruction is supplied via the hash token `+layerId:follow` (or `~layerId:follow`).
- The follow logic ensures a layer is loaded before starting the animation.
- The camera preserves the view's bearing, pitch and zoom (altitude) as they were when the follow started.
- The camera smoothly eases to keep the tip of the drawn line in the same visual position.

How to use:

1. Open or craft a hash including `+myline:follow`.
2. If `myline.geojson` is not present in the style it will be loaded.
3. Once loaded the map will set the camera and start animating the FreeCamera along the line.

Notes and controls:
- The animation only starts when the code sees an exact `+layerId:follow` token; exact token matching avoids accidental triggers when layer names contain similar substrings.
- While the animation runs, the page checks every second whether `:follow` is still present in the hash. If it is removed (for example by the parent frame or by a user), the animation stops and the map applies the new hash camera parameters.
- The animation will not modify the hash itself; this prevents it from creating race conditions with external controllers.

Advanced: how to stop follow programmatically

- Remove `:follow` from the hash or update the layer tokens in the parent controller. The map listens for external changes and stops the follow animation reliably.

---

## Camera / FreeCamera details

- The follow implementation uses Mapbox's FreeCamera to set camera position and a `lookAtPoint` so the tip is always visually centered (accounting for tilt/rotation).
- The camera keeps the initial bearing/pitch/zoom to avoid a disturbing visual jump when the follow starts.
- The animation uses requestAnimationFrame for smooth motion and eases camera center using a configurable smoothing factor.

---

## Examples

- Show two dynamic routes and follow one:

`#31.52888,34.47937,15,30,45/+routeA,+routeB:follow`

- Load a hidden layer for later toggling (keeps it available but hidden):

`#31.5,34.4,12,0,0/~backgroundSites`

- Share a static view without dynamic layers:

`#31.38169,34.34570,10.45,1.6,59.0`

---

## Interactive (inflectible) examples

Below are clickable examples that use the Inflect link syntax. Each link opens the map with the indicated camera and layer state. These are the same constructs used elsewhere in the project (images and webpages) and are editable/copyable.

![img](img/#cover&&&&nibal_2023.jpg)

<img src="img/bts_logo.svg" alt="בצלם: מסעות עקירה]" style="max-width:100px;height:auto;">

## המסע של
# ניבאל אל היסי

<img src="img/scrol-signal.svg" alt="יש לגלול את הדף למטה" style="max-width:100px;height:auto;">


[](img/#cover&10&&&nibal_2023.jpg)

## הקדמה

### כותרת קטנה יותר

מאות ימים ולילות עברו מאז ה-7 באוקטובר. בתקופה זו, בנוסף לעשרות אלפי ההרוגים, מאות אלפי הפצועים, למעלה מ-2,000,000 תושבי עזה עקורים מבתיהם ונאלצים לעקור שוב ושוב בנסיון למצוא מקום בטוח.


[](img/#cover&10&&&nibal_2023.jpg)
זה סיפורה של אחת מהם.


[](map/#)
מפת עזה


[](map/#31.52261,34.43650,14.03,37.6,0.0/+overlay)
אפשר להתקרב ולהפעיל גם שכבת תצ״א עדכנית


[](map/#31.42380,34.35370,10.00,37.6,0.0/+idf-poly-outlines)
נוכל להראות את חלוקת האיזורים של הצבא הישראלי


[](map/#31.42380,34.35370,10.00,37.6,0.0/+idf-poly,+idf-poly-outlines)
וגם לבחור באופן דינמי איזה מתוכם להדליק ולכבות


[](map/#31.52888,34.47937,18.14,15.0,0/+jabalia,+rafah)
אפשר להתמקד ולהציג נקודה, למשל בג׳בליה


[](map/#31.52103,34.46974,12.79,-14.4,30.4/+jabalia-rafah:follow,+jabalia,+rafah)
ולצאת ממנה למסע עד לנקודה אחרת. במקרה הזה המצלמה עוקבת אחרי מסלול שהוגדר ע״י קובץ של מסלול שהעלינו באופן דינמי (נוכל להעלות גם תכנים אחרים באופן דומה)


[](map/#31.38169,34.34570,10.45,1.6,59.0/+jabalia,+rafah)
בכל שלב ניתן לעבור למצב הבא ולהראות גם כמה רחוקה הדרך...


## Troubleshooting

- Follow animation starts unexpectedly:
  - Check the exact tokens in the hash. The map looks for exact tokens like `+myline:follow`. Layer ID substrings do not trigger follow. Use the browser console to inspect the logged tokens.

- Follow animation doesn't start after adding `:follow`:
  - If the layer is dynamic and hasn't finished loading, the map will temporarily remove `:follow`, load the layer, then re-add `:follow` to the hash programmatically so follow starts after load. If you prefer external control, remove `:follow` yourself and add it back after the layer is present.

- The camera jumps when follow starts:
  - Make sure the view's bearing/pitch/zoom are set to the desired values before you add `:follow`. The map preserves those values when starting follow. If you see jumps, test with different bearings and inspect the console logs.

---

## Debugging tips

- Open the browser console and look for follow-related logs:
  - `[FOLLOW] 1. Flying to new location:` — started follow sequence and flew camera to target.
  - `[FOLLOW] 2. Changed visibility of existing layers` — layer visibility applied.
  - `[FOLLOW] 3. Layer loaded:` — the requested source or layer finished loading.
  - `[FOLLOW] 4. Follow initiated for layer:` — follow animation actually started.
  - `[FOLLOW CHECK]` logs — periodic checks while follow runs; they show the exact hash string the page sees and whether the `:follow` token is present.

---

## Embedding the map in an iframe

- The map is designed to be embeddable. When embedded, the parent frame can control the map by updating the iframe `src` hash or by posting messages. If you use hash-driven control ensure you operate on the full hash to avoid partial token collisions.

---

## FAQ

- Q: Why does the camera keep the same zoom during follow?  
  A: Preserving zoom avoids visual scale changes that are often disorienting during follow.

- Q: Can follow change the hash when it completes?  
  A: By design the follow routine avoids modifying the hash to prevent race conditions with parent controllers. External actors should remove `:follow` when appropriate.

- Q: How can I add my own GeoJSON files?  
  A: Place them into the `map/` folder (or serve them from a public URL) and reference them by name (without `.geojson`) with `+filename` in the hash.

---

## Notes for developers

- The JavaScript lives in `map/index.html` and is intentionally self-contained. Key functions to inspect:
  - `parseHash()` — parses camera + layer tokens + followId.
  - `loadAndAddOrReplaceGeoJSON()` — fetches and adds dynamic GeoJSON sources & layers.
  - `followPathWithFreeCamera()` — the FreeCamera follow implementation.
  - `createLayerControls()` — builds the UI panel and wires checkbox/delete/reset actions.

- When editing behavior, keep careful attention to:
  - exact token matching (escape layer ids in regexes)
  - avoiding hash write loops (use timely checks and do not update the hash from inside follow unless necessary)

---

If you'd like, I can:

- add a short screencast (animated GIF) showcasing follow in action,
- or add copyable example links for all the examples above to a small `examples/` page.

Happy mapping!

 -->
