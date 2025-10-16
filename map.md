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
[map/#31.52374,34.43343,15.00,37.6,0.0/~satellite,+overlay](map/#31.52374,34.43343,15.00,37.6,0.0/+overlay)


To reset the default layer visibility simply remove their custom mentions:
[map/#31.51448,34.44919,12.64,37.6,0.0](map/#31.51448,34.44919,12.64,37.6,0.0)


So far we've only played with camera movements and layer visibility from the existing Mapbox style. But we can also use the same syntax to load external geojson layers. For example this path from Jabalia to Rafah:
[map/#31.43672,34.34664,10.16,37.6,0.0/+jabalia-rafah](map/#31.43672,34.34664,10.16,37.6,0.0/+jabalia-rafah)

Simply place a `filename.geojson` in the `/map` directory and load it using the add layer synatax `+filename`.

From that point on it can be shown and hidden like any other layer.


[map/#31.45086,34.38246,11.54,37.6,0.0/+jabalia-rafah(track)](map/#31.45086,34.38246,11.54,37.6,0.0/+jabalia-rafah(track))


We can add a custom style to the new layer by noting which source layer should it look like. For example, we can use the hidden `track` layer as a source like this: `+filename(source)`:
[map/#31.45086,34.38246,11.54,37.6,0.0/+jabalia-rafah(track)](map/#31.45086,34.38246,11.54,37.6,0.0/+jabalia-rafah(track))


[map/#31.52090,34.47332,14.00,19.2,48.5/+jabalia-rafah:follow](map/#31.52090,34.47332,14.00,19.2,48.5/+jabalia-rafah:follow)

With externally loaded paths we can even animate the camera to follow the path by adding the `:follow` syntax:
[map/#31.52090,34.47332,14.00,19.2,48.5/+jabalia-rafah:follow](map/#31.52090,34.47332,14.00,19.2,48.5/+jabalia-rafah:follow)
[map/#31.52090,34.47332,14.00,19.2,48.5/+jabalia-rafah:follow](map/#31.52090,34.47332,14.00,19.2,48.5/+jabalia-rafah:follow)


## TBC…