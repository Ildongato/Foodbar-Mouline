# Mouline location map

Street and building geometry: © OpenStreetMap contributors, retrieved 7 September 2026.
Data is available under the [Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Attribution and further terms: https://www.openstreetmap.org/copyright

Source: https://api.openstreetmap.org/api/0.6/map?bbox=4.437,51.288,4.452,51.2945

`mouline-streets.geojson` is the locally retained source extract, including original
OSM way IDs and only properties used in the illustration. It is provided under ODbL.
The browser loads only one lazy SVG, with a tighter geographic crop on mobile.
Generate both SVGs with `node scripts/render-location-map.mjs` from the repository root.
The rendering uses Mouline's existing neutral palette; road geometry is preserved.

The independent Mouline marker uses the existing verified Google place coordinates
in `lib/data/google-reviews.json`: 51.2911049, 4.4446165. It is not an OSM data edit.
The map is a static overview; clicking it opens the existing Google Maps destination.
There are no zoom controls, location requests, API keys or external map requests at runtime.
