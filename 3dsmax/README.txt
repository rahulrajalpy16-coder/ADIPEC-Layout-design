Stand 15288 · ADIPEC 2026 · 3D models of the added items (revision R6, 15 Oct 2026)
==================================================================================

FOLDERS
  <Item>/<Item>.obj + .mtl + textures   One folder per added item. Wavefront OBJ, units = CENTIMETRES.
  Stand_15288_Complete_R6/              Whole stand with every item placed (separate download, OBJ, cm).
  (GLB copies of every model, in metres with textures embedded, are in the GLB folder.)

ITEMS (size W x H x D in cm, as modelled)
  MT_DP_Console                        67.8 x 122.9 x 71.0   console 653.5 x 685.9 x 1205 mm + lit logo fascia
  NAVIS_DP_Console                     67.8 x 122.9 x 71.0   same enclosure, NAVIS screen/joystick + logo fascia
  Display_Table_1500_Fugro_Sonardyne  152.2 x  95.0 x 52.7   table 1500 x 500 x 950 with Fugro and Sonardyne logos
  Fugro_Seastar_Display_Set            75.0 x  27.0 x 32.0   receiver + monitoring display (sizes assumed)
  Sonardyne_SPRINT-Nav_Cradle          36.0 x  40.5 x 36.0   unit in acrylic cradle (sizes assumed)
  Partner_Brands_Showcase_Panel       123.0 x  70.0 x  0.1   2 x 2 logo grid graphic (applied to the frame face)
  Video_Wall_8_Modules                519.0 x 200.0 x  5.1   8 LED modules, 2 rows x 4, with content
Each item sits on its own base at the origin (base on the floor, centred), front facing +Z in OBJ terms.
All models are low-poly (12 to 3,200 triangles per item; 14,400 for the whole stand) with textures at 2048 px or less.

IMPORT INTO 3DS MAX
  1. Customize > Units Setup: set System Unit to Centimetres (or tick "Convert units" on import).
  2. File > Import > Import..., choose the .obj.
  3. In the OBJ Import Options: keep "Flip ZY-axis" ON (OBJ is Y-up, Max is Z-up), Scale 1.0,
     "Import as single mesh" OFF, and "Import materials" + "Import into Mat-Editor" ON.
     Keep the .mtl and texture files in the same folder as the .obj.
  4. Materials come in as Standard/Physical with diffuse maps. For the screens and lit logos, set the
     map as self-illumination/emission in your renderer for a lit look.

POSITIONS ON THE STAND (plan, cm; x from the left edge seen from the front aisle, y from the rear wall)
  MT console       centre x 75,  y 75   turned 45 deg to face the booth centre (rear-left corner)
  NAVIS console    centre x 410, y 192  square to the front aisle, screen facing the visitors
  Display table    centre x 37,  y 247  long side along the left edge (y 172-322), front to the left aisle
                   Sonardyne on the rear half, Fugro on the front half
  Video wall       back wall, x 40.5-559.5, 120-320 cm above the 10 cm platform
  Partner panel    aisle face of the Sinor Marine (left) corner frame, below the TV
The Stand_15288_Complete_R6 model already has everything placed and can be used as the reference.
