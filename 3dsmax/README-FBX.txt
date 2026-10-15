Stand 15288 · ADIPEC 2026 · FBX models for 3ds Max (revision R6, 15 Oct 2026)
============================================================================

FORMAT
  Autodesk FBX 7.4 binary (opens in 3ds Max 2014 and every later version, also Maya, SketchUp, Revit, Blender).
  Units: CENTIMETRES (stored in the file, so 3ds Max scales correctly whatever your system unit is).
  Textures are EMBEDDED inside each .fbx, so each file is self-contained.
  Each item sits on the floor at the origin, centred, front facing the -Y axis in 3ds Max (towards the Front viewport).

ITEMS (W x H x D in cm, checked by re-importing each FBX)
  MT_DP_Console                        67.8 x 122.9 x 71.0    1,972 triangles
  NAVIS_DP_Console                     67.8 x 122.9 x 71.0    1,720 triangles
  Display_Table_1500_Fugro_Sonardyne  152.2 x  95.0 x 52.7       52 triangles
  Fugro_Seastar_Display_Set            75.0 x  27.0 x 32.0       88 triangles (sizes assumed)
  Sonardyne_SPRINT-Nav_Cradle          36.0 x  40.5 x 36.0    3,196 triangles (sizes assumed)
  Partner_Brands_Showcase_Panel       123.0 x  70.0 x  0.1       12 triangles
  Video_Wall_8_Modules                519.0 x 200.0 x  5.1      112 triangles
  Stand_15288_Complete_R6             601.6 x 400.0 x 500.8  14,378 triangles (whole stand, everything placed)

IMPORT INTO 3DS MAX
  1. File > Import > Import..., pick the .fbx.
  2. In the FBX Import dialog: Presets "Autodesk Media & Entertainment" is fine.
     Under Units tick "Automatic" (default). Under Axis Conversion keep "Y-up" (default).
     Under Geometry, tick "Smoothing Groups"; Materials and Textures come in automatically.
  3. Screens and lit logos carry their image in both Diffuse and Self-Illumination (Emission),
     so they read as lit in Scanline, Arnold, V-Ray and Corona.

POSITIONS ON THE STAND (plan, cm; x from the left edge seen from the front aisle, y from the rear wall)
  MT console       centre x 75,  y 75   turned 45 deg to face the booth centre (rear-left corner)
  NAVIS console    centre x 410, y 192  square to the front aisle, screen facing the visitors
  Display table    centre x 37,  y 247  long side along the left edge, Sonardyne rear half, Fugro front half
  Video wall       back wall, x 40.5-559.5, 120-320 cm above the 10 cm platform
  Partner panel    aisle face of the Sinor Marine (left) corner frame, below the TV
Stand_15288_Complete_R6.fbx already has everything placed and can be used as the reference.
