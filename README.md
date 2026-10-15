# Stand 15288 · ADIPEC 2026 · Interactive 3D booth

Sinor Marine / Amphicos stand (6 × 5 m, peninsula, 4.0 m high) with the four
equipment items and five logos placed per the approved layout of 15 Oct 2026.
The booth structure, size, screens, counter and branding follow the Amphicos
drawings (1:10) and renders; nothing structural was redesigned.

## Run it locally

The app uses ES modules, so it must be served over HTTP (opening `index.html`
from the file system will not work).

```bash
cd adipec-booth
python3 -m http.server 8000
# open http://localhost:8000
```

Any static server works (`npx serve`, VS Code Live Server, nginx). Everything
three.js needs is in `vendor/`, so it runs offline. Only the UI fonts come
from Google Fonts, with system fallbacks.

## Host on GitHub Pages

1. Create a repository and push the contents of this folder to its root
   (`index.html` at the top level).
2. Go to **Settings › Pages**, then choose **Deploy from a branch**, `main`,
   `/ (root)`.
3. The site appears at `https://<user>.github.io/<repo>/` after about a minute.
   All paths are relative, so it also works from a sub-folder.

WebXR (VR) needs HTTPS, and GitHub Pages provides it.

## Controls

| Mode | Desktop | Phone / tablet |
|---|---|---|
| Orbit | Drag to rotate, right-drag to pan, wheel to zoom | One finger to rotate, two to pan, pinch to zoom |
| Walk | `W A S D` / arrows, `Shift` to run, click to lock the mouse, `Esc` to release, wheel to zoom | Left stick to move, drag to look |
| Inspect | Click a numbered tag, an item, or a row in the Equipment list. The camera flies there, highlights the item and shows its card. Use **Back to booth** or `×` to return. | Same, by tapping |
| VR | **Enter VR** on a WebXR headset (Meta Quest browser). Left stick moves (with collision), right stick turns smoothly. | n/a |

The dock holds the Orbit / Walk switch, the view presets (overview, front,
top-down, left, right, interior and one per equipment item), Reset, zoom −/+,
and toggles for labels, dimensions and plan view (roof hidden). The `?` button
opens the instructions and the top-right button toggles full screen.

Deep links work too, for example `index.html#mt` or `index.html#top`.

## Folder structure

```
index.html            UI shell and import map
css/style.css         UI styling
js/main.js            renderer, lights, cameras, presets, UI, selection, VR
js/booth.js           booth structure built to drawing dimensions
js/equipment.js       consoles, display tables, Fugro, Sonardyne, logos + info data
js/navigation.js      walk controller with collision, touch joystick
js/textures.js        texture loading and procedural textures
assets/textures/      logos and screen images taken from the supplied PDFs
assets/models/        reusable GLB exports (see below)
vendor/three/         three.js r160 and the addons used (MIT licence)
docs/approved-layout.html   the approved top-view layout, schedules, conflicts, decisions
docs/views/           presentation renders (desktop and phone)
docs/prep_textures.py how the textures were extracted from the PDFs
```

### GLB models (`assets/models/`)

| File | Contents | Size in model |
|---|---|---|
| `stand-15288-complete.glb` | Booth + all equipment | 6.02 × 4.00 × 5.01 m |
| `stand-15288-booth.glb` | Booth structure, graphics, furniture | 6.02 × 4.00 × 5.01 m |
| `equipment-mt.glb` | MT DP console with hanging logo | |
| `equipment-navis.glb` | NAVIS DP console with hanging logo | |
| `equipment-fugro.glb` | Display table + Fugro receiver and display | |
| `equipment-sonardyne.glb` | Display table + SPRINT-Nav in cradle | |
| `equipment-smt.glb` | SMT logo panel (back wall) | |

Units are metres, Y up. Origin is the stand centre at hall-floor level. The
front aisle is +Z, the Amphicos side is +X. Each file was re-loaded with
GLTFLoader to confirm it parses. They open in Blender, the three.js editor or
any glTF viewer.

## Summary of modifications to the booth

Approved decisions D1–D7 (see `docs/approved-layout.html`):

- **MT DP console** at the rear-left corner (Sinor Marine side) and **NAVIS DP
  console** at the rear-right, both turned 45° to face the booth centre. They
  use the 653.5 × 685.9 × 1,205 mm enclosure from the requirements document.
- **MT and NAVIS logos** are lit panels hung from the rear header frame over
  each console (underside 2.4 m).
- **Fugro** display table on the left edge and **Sonardyne** display table on
  the right edge, each 1000 × 500 × 950 mm, white with a blue LED edge.
  Sonardyne sits in an acrylic cradle.
- **Fugro and Sonardyne logos** were first placed on the rear header's front
  corners. They were removed in revision 3 and now appear only on the table fronts.
- **SMT logo**: originally on the counter front; moved to the back wall in revision 2 (below).
- **Seating**: both table groups moved about 25 cm forward. Chairs are arranged
  so the centre aisle stays clear.
- **Removed**: two potted plants and the two small rear side shelves where the
  consoles stand.

Nothing else changed: wall, header, canopy, frames, columns, lightboxes,
screens, counter shape and platform are as drawn.

## Revision 2 (15 Oct 2026)

Four changes requested by Rahul. Nothing else in the booth was moved or resized.

1. **SMT logo relocated.** It was removed from the centre counter panel and now sits on
   the back wall, centred on the booth's centre line directly below the video wall
   (about 900 × 360 mm, centre 0.80 m above the platform). From the entrance it is
   seen straight down the clear centre aisle between the seating groups, between
   Sinor Marine Services (left header) and Amphicos (right header). The SMS and
   Amphicos counter logos are unchanged.
2. **Counter logos.** The Fugro logo (400 mm wide) and the Sonardyne logo (600 mm
   wide) are centred on the aisle-facing front of their display tables, 0.52 m
   above the platform. Tables and equipment did not move.
3. **Partner Brands Showcase** on marked area 2: the aisle face of the Sinor Marine
   corner frame, below the TV. From revision 3 it shows only partners that are not
   branded anywhere else on the stand. Guidance Marine is at about 950 mm wide, and
   the Xplisi Technologies tile, on its original dark background, is at about
   420 × 410 mm. A hairline divider separates them, on the existing white panel.
4. **8-screen video wall.** The two 2500 × 2000 mm screens are now 8 equal modules
   (2 rows × 4 columns). Each module is about 1290 × 995 mm with a 12 mm black bezel,
   and the gaps are a uniform 10 mm. The wall keeps the original outer footprint
   (5190 × 2000 mm, 1.2–3.2 m above the platform).
   - **Left four:** the four process-overview panels from the image supplied with
     the request. These are stand-ins: no screenshots of the Sinor VR / 3D marine
     simulation platform were provided.
   - **Right four:** the approved marketing artwork, in the arrangement of the
     reference wall: Oil & Gas Industries, Engineering Excellence for the Maritime
     Industry, Engineering Reliable Marine Automation Solutions, and Oil & Gas
     industries.

   The original 16:9 or 5:4 images were cropped slightly to the 1.3:1 module shape.
   The headline text is kept, and nothing is stretched.
   `docs/prep_videowall.py` rebuilds these textures.

Review renders are in `docs/views/rev2/`.

## Revision 3 (15 Oct 2026)

- Removed the Fugro and Sonardyne logos from the rear header's front corners.
- In the Partner Brands Showcase, replaced MT, NAVIS, Fugro and Sonardyne (already
  branded on the consoles and tables) with Guidance Marine and Xplisi Technologies.
- Swapped in the high-resolution Fugro logo on the Fugro table and the official SMT
  logo on the back wall.

Review renders are in `docs/views/rev3/`.

## Revision 4 (15 Oct 2026)

- The Partner Brands Showcase is now a 2 × 2 grid with hairline dividers.
  - Top row: Sinor Marine Technologies and SMT UK.
  - Bottom row: Guidance Marine and Xplisi Technologies.
- The SMT UK logo was supplied at only 281 px wide, so it was upscaled and may look
  soft up close. A vector or larger file would sharpen it.

## What was tested and what was not

**Tested (headless Chromium with SwiftShader software WebGL, scripted with Playwright):**

- The page loads with no console errors.
- All six view presets and all five equipment presets render (`docs/views/`).
- Selecting each item flies the camera, highlights the item and fills the
  card. Back and close return to the booth.
- Clicking an item in the 3D view selects it, and drags are not treated as
  clicks.
- Walk mode: keyboard movement works, and collision stops the camera at walls,
  the counter, tables, consoles and chairs.
- Toggles: labels, dimensions overlay and plan view.
- Phone layout in iPhone 13 emulation: no horizontal overflow, the joystick
  shows in walk mode, the dock buttons are tappable and the info card fits.
- All seven GLB files re-load correctly.

**Not tested:**

- Real iOS and Android devices (touch feel, Safari quirks, performance).
- Meta Quest or any real WebXR headset. The VR button and controller
  locomotion are coded to the WebXR spec but have not been run on hardware.
- Pointer lock on a real desktop browser. Headless mode cannot lock the
  mouse, so the drag-to-look fallback was what ran.
- Frame rate on real GPUs. Bloom is switched off automatically on low-power
  devices.

## Assumptions and open items

- **Fugro Seastar 9410-AUT and its display, and Sonardyne SPRINT-Nav DP**: no
  dimensions were supplied, so sizes are placeholders (marked "assumed" in the
  app). Datasheets are needed to size the cradle and confirm the table.
- **Logo artwork**: revision 3 uses Rahul's high-resolution Fugro logo and the
  official SMT logo from his PDF. `docs/prep_logos.py` rebuilds these textures.
- **SMT logo size**: about 900 × 360 mm on the back wall. Final size to confirm.
- **Seating and lightbox column positions** are scaled from renders and side
  views, so they are approximate.
- **Power ratings** for the consoles and units are unknown. The plan assumes
  everything is fed from the 60 A DB (point B) under the platform.
- **Back-right screen content**: in the source render a person stands in front
  of part of this screen, so that region was patched.
- **Console marked locations (C1)**: the requirements mention them, but none
  of the files shows them. If a marked drawing exists, positions can be matched
  to it.
