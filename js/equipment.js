// New equipment and OEM branding from the Sinor Marine requirements document,
// placed per the approved layout proposal (Stand 15288, 15 Oct 2026).
import * as THREE from 'three';
import { P, FLOOR_Y, HEADER_Y, LOGO_ASPECT, logoPlane, util } from './booth.js';

const { box, plane } = util;
const DEG = Math.PI / 180;

// Data shown in the inspection panel. "verified" = from the supplied documents; "assumed" = placeholder awaiting data.
export const EQUIPMENT = [
  {
    id: 'mt', num: 1, name: 'MT DP Console', short: 'MT DP',
    ident: 'Floor-standing DP console · MT · 26" Hatteland display',
    dims: 'W 653.5 × D 685.9 × H 1,205 mm · desk 767–797 mm',
    dimsSource: 'verified', position: 'Rear-left corner, Sinor Marine side, turned 45° to face the booth centre',
    logo: 'MT lit acrylic panel hung over the console (≈ 700 × 340 mm)',
    power: 'Fed from 60 A DB (B), directly behind',
  },
  {
    id: 'navis', num: 2, name: 'NAVIS DP Console', short: 'NAVIS DP',
    ident: 'Floor-standing DP console · NAVIS Engineering screen and joystick panel',
    dims: 'W 653.5 × D 685.9 × H 1,205 mm (same enclosure as MT)',
    dimsSource: 'verified', position: 'Rear-right corner, Amphicos side, turned 45° to face the booth centre',
    logo: 'NAVIS lit acrylic panel hung over the console (≈ 700 × 250 mm)',
    power: 'Fed from 60 A DB (B) under the platform; point A is build-up only',
  },
  {
    id: 'fugro', num: 3, name: 'Fugro DGPS + Display', short: 'Fugro',
    ident: 'Fugro Seastar 9410-AUT DGPS/GNSS receiver with monitoring display',
    dims: 'Units: receiver ≈ 300 × 280 × 100 mm, display ≈ 320 × 220 mm (assumed). Table 1000 × 500 × 950 mm',
    dimsSource: 'assumed', position: 'Left edge between the corner frame and the lightbox, facing the left aisle',
    logo: 'Fugro logo on the table front (400 mm wide)',
    power: 'Fed from 60 A DB (B)',
  },
  {
    id: 'sonardyne', num: 4, name: 'Sonardyne SPRINT-Nav DP', short: 'Sonardyne',
    ident: 'Sonardyne SPRINT-Nav DP in a lockable cradle',
    dims: 'Unit ≈ Ø240 × 375 mm (assumed). Table 1000 × 500 × 950 mm',
    dimsSource: 'assumed', position: 'Right edge between the corner frame and the lightbox, facing the right aisle',
    logo: 'Sonardyne logo on the table front (600 mm wide)',
    power: 'Fed from 60 A DB (B)',
  },
  {
    id: 'smt', num: 5, name: 'SMT Logo', short: 'SMT',
    ident: 'Sinor Marine Technologies branding',
    dims: 'Lit acrylic ≈ 900 × 360 mm',
    dimsSource: 'assumed', position: 'Back wall, centred under the video wall on the booth centre line, facing the entrance',
    logo: '—', power: 'Back wall lighting circuit',
  },
];

function shadowAll(g) { g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); }

// ---------------- DP console (shared enclosure, MT drawing 5000-501092 Rev B) ----------------
function dpConsole(kind, tex, M) {
  const W = 0.6535, D = 0.6859, H = 1.205;
  const g = new THREE.Group();
  const cabinet = new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.55, metalness: 0.15 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x8c9198, roughness: 0.32, metalness: 0.65 });
  // side profile (z forward, y up) traced from the side view
  const zf = D / 2, zb = -D / 2;
  const prof = [
    [zb, 0], [0.21, 0], [0.21, 0.676], [zf, 0.70], [zf, 0.767], [0.0, 0.797], [-0.16, H], [-0.31, H], [zb, H - 0.035],
  ];
  const shape = new THREE.Shape(prof.map(([z, y]) => new THREE.Vector2(z, y)));
  const body = new THREE.ExtrudeGeometry(shape, { depth: W - 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.012, bevelSegments: 3 });
  body.rotateY(-Math.PI / 2); body.translate(W / 2 - 0.02, 0, 0);
  g.add(new THREE.Mesh(body, cabinet));
  // grey side cheeks around the monitor housing and desk
  for (const s of [-1, 1]) {
    const ch = new THREE.Shape([[0.05, 0.66], [zf + 0.005, 0.69], [zf + 0.005, 0.775], [0.0, 0.81], [-0.165, H + 0.006], [-0.30, H + 0.006], [-0.25, 1.05], [-0.08, 0.72]].map(([z, y]) => new THREE.Vector2(z, y)));
    const cg = new THREE.ExtrudeGeometry(ch, { depth: 0.012, bevelEnabled: false });
    cg.rotateY(-Math.PI / 2); cg.translate(s * (W / 2 + 0.006) + 0.006, 0, 0);
    g.add(new THREE.Mesh(cg, trim));
  }
  // monitor face: slanted plane from (z 0, y 0.797) to (z -0.16, y 1.205)
  const tilt = Math.atan2(0.16, 0.408);
  const face = new THREE.Group(); face.position.set(0, (0.797 + H) / 2, -0.08); face.rotation.x = -tilt;
  face.add(plane(0.62, 0.42, new THREE.MeshStandardMaterial({ color: 0x050607, roughness: 0.15, metalness: 0.4 }), 0, 0, 0.016));
  face.add(plane(0.56, 0.35, M.screen(kind === 'mt' ? tex.mtScreen : tex.navisScreen), 0, 0.01, 0.018));
  g.add(face);
  // desk panel
  const desk = new THREE.Group(); desk.position.set(0, 0.784, 0.17); desk.rotation.x = -Math.PI / 2 + 0.096;
  desk.add(plane(0.6, 0.31, M.screen(kind === 'mt' ? tex.mtPanel : tex.navisPanel), 0, 0, 0.015));
  g.add(desk);
  // desk front edge trim
  g.add(box(W, 0.035, 0.02, trim, 0, 0.75, zf - 0.005));
  if (kind === 'mt') {
    // joystick and trackball as on the MT photo
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.1, 16), M.black); stick.position.set(0.06, 0.852, 0.15); g.add(stick);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 12), M.black); knob.position.set(0.06, 0.907, 0.15); g.add(knob);
    const boot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.black); boot.position.set(0.06, 0.807, 0.15); g.add(boot);
    const tb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), trim); tb.position.set(0.24, 0.807, 0.12); g.add(tb);
    const tbr = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.007, 8, 24), new THREE.MeshStandardMaterial({ color: 0xc0262b, roughness: 0.4 }));
    tbr.rotation.x = Math.PI / 2; tbr.position.set(0.24, 0.812, 0.12); g.add(tbr);
  } else {
    // NAVIS joystick: dome base + grip
    const base = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.black); base.position.set(0.15, 0.807, 0.17); g.add(base);
    const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.08, 6, 16), new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 0.45 }));
    grip.position.set(0.15, 0.912, 0.17); g.add(grip);
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.025, 32), new THREE.MeshStandardMaterial({ color: 0x1f4fd0, roughness: 0.3, metalness: 0.3 }));
    dial.position.set(-0.155, 0.812, 0.16); g.add(dial);
  }
  // front cabinet handles
  for (const s of [-1, 1]) g.add(box(0.06, 0.07, 0.015, trim, s * 0.2, 0.6, 0.228));
  shadowAll(g);
  return g;
}

// ---------------- Suspended OEM logo panel (double-sided lit acrylic) ----------------
function hangingLogo(t, asp, M, width = 0.66) {
  const g = new THREE.Group();
  const h = width / asp + 0.12;
  g.add(box(width + 0.08, h, 0.025, M.whiteGloss, 0, 0, 0));
  g.add(box(width + 0.09, 0.012, 0.03, M.ledBlue, 0, -h / 2, 0));
  for (const s of [1, -1]) {
    const l = logoPlane(t, width, asp, M); l.position.z = s * 0.014; if (s < 0) l.rotation.y = Math.PI; g.add(l);
  }
  return { group: g, h };
}

// ---------------- Display table 1000 x 500 x 950 (white plinth, blue LED edge) ----------------
function displayTable(M, logo) {
  const g = new THREE.Group();
  const L = 1.0, Dp = 0.5, H = 0.95;
  g.add(box(L, H - 0.03, Dp, M.white, 0, (H - 0.03) / 2, 0));
  g.add(box(L + 0.02, 0.03, Dp + 0.02, M.whiteGloss, 0, H - 0.015, 0));
  g.add(box(L + 0.022, 0.01, 0.01, M.ledBlue, 0, H - 0.035, Dp / 2 + 0.012));
  g.add(box(L, 0.01, 0.01, M.ledBlue, 0, 0.03, Dp / 2 + 0.003));
  shadowAll(g);
  // manufacturer logo centred on the aisle-facing front panel
  if (logo) { const m = logoPlane(logo.t, logo.w, logo.a, M); m.position.set(0, 0.52, Dp / 2 + 0.003); m.name = logo.name; g.add(m); }
  return g;
}

function fugroSet(tex, M) {
  const g = new THREE.Group();
  const top = 0.95;
  // receiver (assumed 300 x 100 x 280)
  const rx = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0xd9dcde, roughness: 0.35, metalness: 0.2 });
  const navy = new THREE.MeshStandardMaterial({ color: 0x2d3157, roughness: 0.45 });
  rx.add(box(0.30, 0.10, 0.28, body, 0, 0.05, 0));
  for (const s of [-1, 1]) rx.add(box(0.004, 0.07, 0.24, navy, s * 0.151, 0.045, -0.01));
  rx.add(box(0.15, 0.004, 0.24, navy, 0.03, 0.101, -0.01));
  rx.add(plane(0.30, 0.12, M.screen(tex.fugroRxFront), 0, 0.055, 0.1405));
  rx.position.set(-0.22, top, 0.02); rx.rotation.y = 8 * DEG;
  g.add(rx);
  // display (assumed 320 x 220) on a tilt stand
  const dsp = new THREE.Group();
  dsp.add(box(0.32, 0.22, 0.03, M.bezel, 0, 0, 0));
  dsp.add(plane(0.318, 0.218, M.screen(tex.fugroDisplay), 0, 0, 0.0155));
  dsp.position.set(0.2, top + 0.15, 0.02); dsp.rotation.x = -12 * DEG; dsp.rotation.y = -8 * DEG;
  g.add(dsp);
  g.add(box(0.12, 0.012, 0.12, M.bezel, 0.2, top + 0.006, 0.03));
  g.add(box(0.03, 0.06, 0.03, M.bezel, 0.2, top + 0.04, 0.0));
  shadowAll(g);
  return g;
}

function sonardyneSet(tex, M) {
  const g = new THREE.Group();
  const top = 0.95;
  const alu = new THREE.MeshStandardMaterial({ color: 0xd7dade, roughness: 0.22, metalness: 1.0 });
  // lathe profile (r, y) scaled from the product photo, overall ≈ Ø240 x 375 (assumed)
  const prof = [[0.0, 0.0], [0.02, 0.0], [0.115, 0.06], [0.115, 0.07], [0.135, 0.075], [0.135, 0.095], [0.12, 0.10], [0.12, 0.30], [0.135, 0.305], [0.135, 0.33], [0.06, 0.335], [0.06, 0.355], [0.04, 0.358], [0.04, 0.375], [0.0, 0.375]];
  const unit = new THREE.Group();
  unit.add(new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 64), alu));
  const bandTex = tex.sonardyneBand;
  const bandFront = new THREE.Mesh(new THREE.CylinderGeometry(0.1215, 0.1215, 0.108, 64, 1, true, -Math.PI / 2, Math.PI), M.screen(bandTex));
  const bandBack = new THREE.Mesh(new THREE.CylinderGeometry(0.1215, 0.1215, 0.108, 64, 1, true, Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: 0x2b3a78, roughness: 0.4 }));
  bandFront.position.y = bandBack.position.y = 0.215;
  bandFront.material.toneMapped = true;
  unit.add(bandFront, bandBack);
  // cradle: acrylic base, socket cup, clamp ring on three posts
  const acrylic = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.35 });
  g.add(box(0.36, 0.02, 0.36, acrylic, 0, top + 0.01, 0));
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.06, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0x1b1d20, roughness: 0.5, side: THREE.DoubleSide }));
  cup.position.y = top + 0.05; g.add(cup);
  const clamp = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.008, 10, 48), new THREE.MeshStandardMaterial({ color: 0x1b1d20, roughness: 0.4, metalness: 0.4 }));
  clamp.rotation.x = Math.PI / 2; clamp.position.y = top + 0.02 + 0.13; g.add(clamp);
  for (let i = 0; i < 3; i++) {
    const a = i * 2 * Math.PI / 3 + Math.PI / 6;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.13, 8), clamp.material);
    post.position.set(Math.cos(a) * 0.13, top + 0.085, Math.sin(a) * 0.13); g.add(post);
  }
  unit.position.y = top + 0.03;
  g.add(unit);
  shadowAll(g);
  return g;
}

// Builds all items; returns groups keyed by id plus colliders and roof-mounted parts.
export function buildEquipment(tex, M, roof) {
  const root = new THREE.Group(); root.name = 'NewEquipment';
  const items = {};
  const colliders = [];

  // 1 + 2: consoles in the rear corners, rotated 45° toward the booth centre
  const consoles = [
    { id: 'mt', c: P(75, 425), rot: 45 * DEG, logo: tex.logoMt, asp: LOGO_ASPECT.mt, lw: 0.6 },
    { id: 'navis', c: P(525, 425), rot: -45 * DEG, logo: tex.logoNavis, asp: LOGO_ASPECT.navis, lw: 0.7 },
  ];
  for (const k of consoles) {
    const g = new THREE.Group(); g.name = `Equipment_${k.id}`;
    const con = dpConsole(k.id, tex, M); g.add(con);
    g.position.set(k.c.x, FLOOR_Y, k.c.z); g.rotation.y = k.rot;
    root.add(g);
    // hanging logo: arm from the back wall top, two cables, panel underside ≈ 2.40 m above platform
    const hl = hangingLogo(k.logo, k.asp, M, k.lw);
    const hy = FLOOR_Y + 2.4 + hl.h / 2;
    hl.group.position.set(k.c.x, hy, k.c.z); hl.group.rotation.y = k.rot; hl.group.name = `Logo_${k.id}_Hanging`;
    roof.add(hl.group);
    const arm = box(0.04, 0.04, Math.abs(-2.45 - k.c.z) + 0.05, M.white, k.c.x, HEADER_Y - 0.06, (k.c.z - 2.45) / 2);
    roof.add(arm);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x9aa3ab });
    const cableLen = HEADER_Y - 0.08 - (hy + hl.h / 2);
    for (const s of [-1, 1]) {
      const off = new THREE.Vector3(s * (k.lw / 2), 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), k.rot);
      const cab = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, cableLen, 4), cableMat);
      cab.position.set(k.c.x + off.x, hy + hl.h / 2 + cableLen / 2, k.c.z + off.z); roof.add(cab);
    }
    // cross bar so the cables have an anchor across the arm
    const cb = box(k.lw + 0.04, 0.03, 0.03, M.white, k.c.x, HEADER_Y - 0.09, k.c.z); cb.rotation.y = k.rot; roof.add(cb);
    items[k.id] = { group: g, focusHeight: 0.95, facing: k.rot, dist: 1.9 };
    colliders.push({ type: 'obb', cx: k.c.x, cz: k.c.z, hx: 0.36, hz: 0.37, rot: k.rot });
  }

  // 3 + 4: display tables along the side edges, long side to the aisle
  const tables = [
    { id: 'fugro', c: P(37, 230), rot: -Math.PI / 2, set: fugroSet, logo: { t: tex.logoFugro, a: LOGO_ASPECT.fugro, w: 0.40, name: 'Logo_Fugro_Table' } },
    { id: 'sonardyne', c: P(563, 230), rot: Math.PI / 2, set: sonardyneSet, logo: { t: tex.logoSonardyne, a: LOGO_ASPECT.sonardyne, w: 0.60, name: 'Logo_Sonardyne_Table' } },
  ];
  for (const t of tables) {
    const g = new THREE.Group(); g.name = `Equipment_${t.id}`;
    g.add(displayTable(M, t.logo)); g.add(t.set(tex, M));
    g.position.set(t.c.x, FLOOR_Y, t.c.z); g.rotation.y = t.rot;
    root.add(g);
    items[t.id] = { group: g, focusHeight: 1.05, facing: t.rot, dist: 1.6 };
    colliders.push({ type: 'obb', cx: t.c.x, cz: t.c.z, hx: 0.27, hz: 0.52, rot: 0 });
  }

  return { root, items, colliders };
}
