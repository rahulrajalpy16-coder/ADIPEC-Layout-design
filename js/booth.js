// Existing Amphicos / Sinor Marine booth, built from "Amphicos Booth.pdf" (scale 1:10 drawings).
// World units are metres. Origin is the stand centre at hall-floor level.
// +X = right (Amphicos side), -X = left (Sinor Marine side), +Z = front aisle, -Z = rear (Stand 15285).
import * as THREE from 'three';

export const STAND = { w: 6, d: 5, platform: 0.10, wallH: 3.30, headerH: 0.60 };
export const FLOOR_Y = STAND.platform;              // top of raised platform
export const HEADER_Y = FLOOR_Y + STAND.wallH;        // underside of header (3.40)

// Plan coordinates in cm (x from left edge, y from front edge) -> world
export function P(xcm, ycm) { return { x: xcm / 100 - STAND.w / 2, z: STAND.d / 2 - ycm / 100 }; }

export function makeMaterials(tex) {
  const M = {
    white: new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.42, metalness: 0.0 }),
    whiteGloss: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.18, metalness: 0.0 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x1d9ad6, roughness: 0.35, metalness: 0.05 }),
    blueDeep: new THREE.MeshStandardMaterial({ color: 0x0f86c8, roughness: 0.45, emissive: 0x0a4f7a, emissiveIntensity: 0.35 }),
    ledBlue: new THREE.MeshBasicMaterial({ color: 0x3fc4ff, toneMapped: false }),
    ledWhite: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    black: new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.5, metalness: 0.1 }),
    bezel: new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 0.25, metalness: 0.3 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.12, metalness: 0.9 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xdfe8ee, roughness: 0.05, metalness: 0, transmission: 0.0, transparent: true, opacity: 0.55 }),
    wood: new THREE.MeshStandardMaterial({ color: 0xc89a62, roughness: 0.6 }),
    ring: new THREE.MeshStandardMaterial({ color: 0x1e9ee0, roughness: 0.55 }),
    hallFloor: new THREE.MeshStandardMaterial({ map: tex.floor, color: 0xffffff, roughness: 0.32, metalness: 0.25 }),
  };
  M.screen = (t) => new THREE.MeshBasicMaterial({ map: t, toneMapped: false });
  // LED panel: emissive image with a faint gloss so it picks up hall reflections
  M.display = (t) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: t, roughness: 0.22, metalness: 0, envMapIntensity: 0.35, toneMapped: false });
  M.logo = (t) => new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.35, side: THREE.FrontSide });
  return M;
}

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  return m;
}
function plane(w, h, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  return m;
}
export const util = { box, plane };

// Logo plane sized by width; height follows the texture aspect once loaded (aspect passed in to avoid async).
export function logoPlane(texture, width, aspect, M) {
  const m = plane(width, width / aspect, M.logo(texture));
  m.renderOrder = 2;
  return m;
}

export const LOGO_ASPECT = {
  sms: 1600 / 712, amphicos: 1600 / 444, smt: 1600 / 582, mt: 1200 / 586,
  navis: 474 / 169, fugro: 1600 / 767, sonardyne: 385 / 107, guidance: 1600 / 285, xplisi: 538 / 529, smtUk: 1007 / 436,
};

export function buildBooth(tex, M) {
  const booth = new THREE.Group(); booth.name = 'Booth';
  const roof = new THREE.Group(); roof.name = 'Roof'; // header, canopy, hanging items (hidden in plan view)
  const colliders = [];
  const Y0 = FLOOR_Y;

  // ---------- Hall floor ----------
  const hall = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.hallFloor);
  hall.rotation.x = -Math.PI / 2; hall.receiveShadow = true; hall.name = 'HallFloor';
  booth.add(hall);

  // ---------- Raised platform 600 x 500 x 10 ----------
  const platform = box(STAND.w, STAND.platform, STAND.d, M.white, 0, STAND.platform / 2, 0);
  platform.name = 'Platform'; booth.add(platform);
  // blue LED edge on the three open sides
  const led = (w, d, x, z) => booth.add(box(w, 0.025, d, M.ledBlue, x, 0.035, z));
  led(STAND.w + 0.01, 0.012, 0, STAND.d / 2 + 0.002);
  led(0.012, STAND.d, -STAND.w / 2 - 0.002, 0);
  led(0.012, STAND.d, STAND.w / 2 + 0.002, 0);

  // Floor ring sticker: outer Ø465, inner Ø365, centred at plan (300, 242)
  const rc = P(300, 242);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.83, 2.325, 128), M.ring);
  ring.rotation.x = -Math.PI / 2; ring.position.set(rc.x, Y0 + 0.002, rc.z); ring.receiveShadow = true;
  ring.name = 'FloorRing'; booth.add(ring);

  // ---------- Back wall 600 x 330 with two 250 x 200 screens ----------
  const back = box(STAND.w, STAND.wallH, 0.10, M.white, 0, Y0 + STAND.wallH / 2, -STAND.d / 2 + 0.05);
  back.name = 'BackWall'; booth.add(back);
  colliders.push({ type: 'obb', cx: 0, cz: -STAND.d / 2 + 0.05, hx: 3, hz: 0.08, rot: 0 });
  // Video wall: the two 250 x 200 screens become 8 equal modules (2 rows x 4 columns) in the same
  // 519 x 200 footprint (plan x 40.5-559.5, h 120-320 above the platform), with uniform 1 cm gaps.
  // Left four: Sinor platform content; right four: approved marketing artwork.
  const wallZ = -STAND.d / 2 + 0.10;
  const VW = { x0: P(40.5, 0).x, x1: P(559.5, 0).x, y0: Y0 + 1.2, y1: Y0 + 3.2, gap: 0.01, bezel: 0.012 };
  const mw = (VW.x1 - VW.x0 - 3 * VW.gap) / 4, mh = (VW.y1 - VW.y0 - VW.gap) / 2;
  const vwTex = [tex.vwLeft1, tex.vwLeft2, tex.vwRight1, tex.vwRight2, tex.vwLeft3, tex.vwLeft4, tex.vwRight3, tex.vwRight4];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    const g = new THREE.Group();
    g.name = `VideoWall_${c < 2 ? 'Left' : 'Right'}_${r * 2 + (c % 2) + 1}`;
    g.add(box(mw, mh, 0.05, M.bezel, 0, 0, 0.025));
    g.add(plane(mw - 2 * VW.bezel, mh - 2 * VW.bezel, M.display(vwTex[r * 4 + c]), 0, 0, 0.0506));
    g.position.set(VW.x0 + mw / 2 + c * (mw + VW.gap), VW.y1 - mh / 2 - r * (mh + VW.gap), wallZ);
    booth.add(g);
  }
  for (const xc of [165.5, 434.5]) {
    const p = P(xc, 0);
    // 130 x 35 shelf at h=102 with blue light below
    const sh = box(1.3, 0.035, 0.35, M.white, p.x, Y0 + 1.02, -STAND.d / 2 + 0.1 + 0.175);
    booth.add(sh);
    booth.add(box(1.3, 0.008, 0.012, M.ledBlue, p.x, Y0 + 1.0, -STAND.d / 2 + 0.1 + 0.35));
  }
  // SMT logo (relocated from the counter): back wall, on the booth centre line under the video wall
  const smtLogo = logoPlane(tex.logoSmt, 0.9, LOGO_ASPECT.smt, M);
  smtLogo.position.set(0, Y0 + 0.80, wallZ + 0.006); smtLogo.name = 'Logo_SMT_BackWall'; booth.add(smtLogo);

  // ---------- Rear header frame 600 x 260, fascia 60 high, 12 thick, rounded front corners ----------
  {
    const r = 0.3, t = 0.12;
    const z0 = -0.1, z1 = 2.5; // shape y = -worldZ
    const outer = new THREE.Shape();
    outer.moveTo(-3, z1); outer.lineTo(3, z1); outer.lineTo(3, z0 + r);
    outer.absarc(3 - r, z0 + r, r, 0, -Math.PI / 2, true);
    outer.lineTo(-3 + r, z0);
    outer.absarc(-3 + r, z0 + r, r, -Math.PI / 2, -Math.PI, true);
    outer.lineTo(-3, z1);
    const hole = new THREE.Path();
    hole.moveTo(-3 + t, z1 - t); hole.lineTo(-3 + t, z0 + t); hole.lineTo(3 - t, z0 + t); hole.lineTo(3 - t, z1 - t); hole.lineTo(-3 + t, z1 - t);
    outer.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(outer, { depth: STAND.headerH, bevelEnabled: false, curveSegments: 16 });
    g.rotateX(-Math.PI / 2);
    const header = new THREE.Mesh(g, M.white); header.position.y = HEADER_Y; header.castShadow = true; header.receiveShadow = true;
    header.name = 'RearHeader'; roof.add(header);
    // blue light line under the side and front fascia
    roof.add(box(0.12, 0.02, 2.6, M.ledBlue, -2.94, HEADER_Y - 0.01, -1.2));
    roof.add(box(0.12, 0.02, 2.6, M.ledBlue, 2.94, HEADER_Y - 0.01, -1.2));
    // Side header logos (existing): SMS on left, Amphicos on right, centred 104 cm from rear
    const zc = P(0, 396).z;
    const sms = logoPlane(tex.logoSms, 1.24, LOGO_ASPECT.sms, M);
    sms.position.set(-3.004, HEADER_Y + 0.3, zc); sms.rotation.y = -Math.PI / 2; sms.name = 'Logo_SMS_Header'; roof.add(sms);
    const amph = logoPlane(tex.logoAmphicos, 1.44, LOGO_ASPECT.amphicos, M);
    amph.position.set(3.004, HEADER_Y + 0.3, zc); amph.rotation.y = Math.PI / 2; amph.name = 'Logo_Amphicos_Header'; roof.add(amph);
  }

  // ---------- Semicircular canopy Ø465 with 700 x 50 flexible screen ----------
  {
    const c = P(300, 240); // canopy centre on the front edge of the rear header
    const R = 2.325;
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(R, R, 0.5, 96, 1, true, -Math.PI / 2, Math.PI),
      M.screen(tex.ledBand));
    band.position.set(c.x, HEADER_Y + 0.3, c.z); band.name = 'FlexibleScreen'; roof.add(band);
    const rim = (y) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.005, R + 0.005, 0.05, 96, 1, true, -Math.PI / 2, Math.PI), M.white);
      m.position.set(c.x, y, c.z); roof.add(m);
    };
    rim(HEADER_Y + 0.025); rim(HEADER_Y + 0.575);
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.12, R - 0.12, 0.6, 96, 1, true, -Math.PI / 2, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.45, side: THREE.BackSide }));
    inner.position.set(c.x, HEADER_Y + 0.3, c.z); roof.add(inner);
    // ceiling (blue, with downlights) and top cap
    const ceil = new THREE.Mesh(new THREE.CircleGeometry(R - 0.12, 96, 0, Math.PI), M.blueDeep);
    ceil.geometry.rotateX(Math.PI / 2); ceil.position.set(c.x, HEADER_Y + 0.002, c.z); roof.add(ceil);
    const ringW = new THREE.Mesh(new THREE.RingGeometry(R - 0.12, R, 96, 1, 0, Math.PI), M.white);
    ringW.geometry.rotateX(Math.PI / 2); ringW.position.set(c.x, HEADER_Y, c.z); roof.add(ringW);
    const cap = new THREE.Mesh(new THREE.CircleGeometry(R, 96, Math.PI, Math.PI), M.blue);
    cap.geometry.rotateX(-Math.PI / 2); cap.position.set(c.x, HEADER_Y + 0.6, c.z); roof.add(cap);
    // downlights from the header bottom view: offsets in cm (across, forward from the canopy centre)
    const spots = [[0, 186], [-75, 136], [0, 136], [76, 136], [-151, 86], [-75, 86], [0, 86], [76, 86], [151, 86], [-151, 36], [-75, 36], [0, 36], [76, 36], [151, 36]];
    const dl = new THREE.CircleGeometry(0.045, 20); dl.rotateX(Math.PI / 2);
    for (const [dx, dz] of spots) {
      const m = new THREE.Mesh(dl, M.ledWhite); m.position.set(c.x + dx / 100, HEADER_Y - 0.002, c.z + dz / 100); roof.add(m);
    }
  }

  // ---------- Two angled frames 165 x 330 at the front corners ----------
  const frames = [
    { side: 'L', c: P(62, 62), rot: Math.PI / 4, logo: tex.logoSms, la: LOGO_ASPECT.sms, tv: tex.tvSms, name: 'Frame_SinorMarine' },
    { side: 'R', c: P(538, 62), rot: -Math.PI / 4, logo: tex.logoAmphicos, la: LOGO_ASPECT.amphicos, tv: tex.tvAmphicos, name: 'Frame_Amphicos' },
  ];
  for (const f of frames) {
    const g = new THREE.Group(); g.name = f.name;
    const W = 1.65, H = 3.3, T = 0.12;
    g.add(box(W, H, T, M.blue, 0, H / 2, 0));
    for (const s of [1, -1]) {
      const face = new THREE.Group(); face.rotation.y = s > 0 ? 0 : Math.PI;
      face.add(plane(W - 0.24, H - 0.3, M.white, 0, H / 2, T / 2 + 0.003));
      // white light line
      const lw = 0.018, ins = 0.075;
      face.add(plane(W - 2 * ins, lw, M.ledWhite, 0, H - ins, T / 2 + 0.004));
      face.add(plane(W - 2 * ins, lw, M.ledWhite, 0, ins, T / 2 + 0.004));
      face.add(plane(lw, H - 2 * ins, M.ledWhite, -W / 2 + ins, H / 2, T / 2 + 0.004));
      face.add(plane(lw, H - 2 * ins, M.ledWhite, W / 2 - ins, H / 2, T / 2 + 0.004));
      const lg = logoPlane(f.logo, f.side === 'L' ? 1.1 : 1.2, f.la, M); lg.position.set(0, 2.52, T / 2 + 0.006); face.add(lg);
      face.add(box(1.23, 0.70, 0.04, M.bezel, 0, 1.84, T / 2 + 0.02));
      face.add(plane(1.21, 0.68, M.screen(f.tv), 0, 1.84, T / 2 + 0.041));
      if (s > 0) {
        face.add(box(0.5, 0.03, 0.35, M.white, 0, 1.02, T / 2 + 0.175));
        face.add(box(0.5, 0.008, 0.01, M.ledBlue, 0, 1.0, T / 2 + 0.35));
        face.add(laptop(f.tv, M, 0, 1.035, T / 2 + 0.17));
      } else if (f.side === 'L') {
        face.add(partnerShowcase(tex, M, T)); // marked area 2, below the TV on the aisle face
      }
      g.add(face);
    }
    g.position.set(f.c.x, FLOOR_Y, f.c.z); g.rotation.y = f.rot;
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    booth.add(g);
    colliders.push({ type: 'obb', cx: f.c.x, cz: f.c.z, hx: 0.85, hz: 0.1, rot: f.rot });
    // laptop shelf zone in front of the frame
    const off = new THREE.Vector3(0, 0, 0.25).applyAxisAngle(new THREE.Vector3(0, 1, 0), f.rot);
    colliders.push({ type: 'obb', cx: f.c.x + off.x, cz: f.c.z + off.z, hx: 0.27, hz: 0.2, rot: f.rot });
  }

  // ---------- Lightbox columns: three poles + 75 x 150 lightbox, ~1.75 m from rear ----------
  for (const s of [-1, 1]) {
    const g = new THREE.Group(); g.name = s < 0 ? 'Lightbox_Left' : 'Lightbox_Right';
    const zc = P(0, 325).z, xc = s * 2.94;
    const pole = new THREE.CylinderGeometry(0.028, 0.028, STAND.wallH, 20);
    for (const dz of [-0.12, 0, 0.12]) {
      const m = new THREE.Mesh(pole, M.whiteGloss); m.position.set(0, STAND.wallH / 2, dz); m.castShadow = true; g.add(m);
    }
    g.add(box(0.07, 1.5, 0.75, M.blue, 0, 1.04 + 0.75, 0));
    for (const side of [1, -1]) {
      const p = plane(0.71, 1.46, M.screen(tex.lightbox), side * 0.0365, 1.04 + 0.75, 0);
      p.rotation.y = side * Math.PI / 2; g.add(p);
    }
    g.position.set(xc, FLOOR_Y, zc); booth.add(g);
    colliders.push({ type: 'obb', cx: xc, cz: zc, hx: 0.08, hz: 0.42, rot: 0 });
  }

  // ---------- Reception counter 170 x 50 x 95, curved, with lit logos ----------
  const counter = buildCounter(tex, M);
  booth.add(counter.group);
  colliders.push(...counter.colliders);

  // ---------- Seating: 2 round tables + 3 chairs each (moved ~25 cm forward) ----------
  for (const s of [-1, 1]) {
    const c = P(s < 0 ? 190 : 410, 225);
    const g = seatingGroup(M, s); g.position.set(c.x, FLOOR_Y, c.z); g.name = s < 0 ? 'Seating_Left' : 'Seating_Right';
    booth.add(g);
    colliders.push({ type: 'circle', cx: c.x, cz: c.z, r: 0.38 });
    g.userData.chairs.forEach(ch => {
      const wp = new THREE.Vector3(); ch.getWorldPosition(wp);
      colliders.push({ type: 'circle', cx: c.x + ch.position.x, cz: c.z + ch.position.z, r: 0.24 });
    });
  }

  booth.add(roof);
  booth.traverse(o => { if (o.isMesh && o.castShadow === undefined) o.castShadow = true; });
  return { booth, roof, colliders, counter, smtLogo };
}

// Partner Brands Showcase: brands not shown elsewhere on the stand plus the two SMT group logos
// Rahul asked for here. 2 x 2 grid on the existing white panel, hairline dividers.
function partnerShowcase(tex, M, T) {
  const g = new THREE.Group(); g.name = 'PartnerBrandsShowcase';
  const z = T / 2 + 0.006;
  const cells = [ // [texture, aspect, max width, max height, name], row-major, top row first
    [tex.logoSmt, LOGO_ASPECT.smt, 0.56, 0.22, 'SinorMarineTechnologies'], [tex.logoSmtUk, LOGO_ASPECT.smtUk, 0.50, 0.22, 'SMT_UK'],
    [tex.logoGuidance, LOGO_ASPECT.guidance, 0.58, 0.22, 'GuidanceMarine'], [tex.logoXplisi, LOGO_ASPECT.xplisi, 0.56, 0.27, 'Xplisi'],
  ];
  const xs = [-0.33, 0.33], ys = [1.18, 0.76];
  cells.forEach(([t, a, mw, mh, n], i) => {
    const m = logoPlane(t, Math.min(mw, mh * a), a, M); m.position.set(xs[i % 2], ys[i >> 1], z); m.name = `Partner_${n}`; g.add(m);
  });
  const hair = new THREE.MeshBasicMaterial({ color: 0xc8d2da });
  g.add(plane(0.003, 0.70, hair, 0, 0.97, T / 2 + 0.005));
  g.add(plane(1.22, 0.003, hair, 0, 0.97, T / 2 + 0.005));
  return g;
}

function laptop(screenTex, M, x, y, z) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.016, 0.23), M.chrome); base.position.y = 0.008; g.add(base);
  const lid = new THREE.Group(); lid.position.set(0, 0.016, -0.11); lid.rotation.x = -0.32;
  const shell = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.22, 0.008), M.chrome); shell.position.y = 0.11; lid.add(shell);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.19), M.screen(screenTex)); scr.position.set(0, 0.112, 0.0045); lid.add(scr);
  g.add(lid);
  g.position.set(x, y, z);
  return g;
}

function seatingGroup(M, side) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.02, 48), M.glass); top.position.y = 0.74; g.add(top);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 16), M.whiteGloss); stem.position.y = 0.37; g.add(stem);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.02, 32), M.whiteGloss); foot.position.y = 0.01; g.add(foot);
  const chairs = [];
  // chairs at the rear, outer side and front so the centre aisle stays clear
  for (const a of [Math.PI * 0.5, side < 0 ? Math.PI : 0, Math.PI * 1.5]) {
    const ch = chair(M);
    ch.position.set(Math.cos(a) * 0.62, 0, -Math.sin(a) * 0.62);
    ch.lookAt(0, 0, 0);
    g.add(ch); chairs.push(ch);
  }
  g.userData.chairs = chairs;
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

function chair(M) {
  // shell chair with oak legs (as rendered)
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.05, 0.44), M.white); seat.position.y = 0.45; g.add(seat);
  const backG = new THREE.CylinderGeometry(0.26, 0.26, 0.32, 24, 1, true, Math.PI * 0.62, Math.PI * 0.76);
  const backM = new THREE.Mesh(backG, new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.4, side: THREE.DoubleSide }));
  backM.position.set(0, 0.66, 0.05); g.add(backM);
  const leg = new THREE.CylinderGeometry(0.015, 0.018, 0.45, 10);
  for (const [x, z] of [[-0.19, -0.17], [0.19, -0.17], [-0.19, 0.17], [0.19, 0.17]]) {
    const l = new THREE.Mesh(leg, M.wood); l.position.set(x * 1.05, 0.225, z * 1.05); l.rotation.z = -x * 0.25; l.rotation.x = z * 0.25; g.add(l);
  }
  return g;
}

function buildCounter(tex, M) {
  // Arc band following the floor ring: radii 1.85-2.35 m about the ring centre, 1.70 m long at the front face.
  const rc = P(300, 242);
  const Ro = 2.35, Ri = 1.85, H = 0.95;
  const half = (1.7 / Ro) / 2; // half-angle
  const shape = new THREE.Shape();
  // shape in (x, y=-z) about ring centre; angle 0 points to +Z (front)
  const pt = (r, a) => new THREE.Vector2(r * Math.sin(a), -r * Math.cos(a));
  const N = 24;
  shape.moveTo(pt(Ri, -half).x, pt(Ri, -half).y);
  for (let i = 0; i <= N; i++) { const a = -half + (2 * half) * i / N; const p = pt(Ro, a); shape.lineTo(p.x, p.y); }
  for (let i = N; i >= 0; i--) { const a = -half + (2 * half) * i / N; const p = pt(Ri, a * (Ro / Ri) * 0.86); shape.lineTo(p.x, p.y); }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: H, bevelEnabled: false, curveSegments: 4 });
  geo.rotateX(-Math.PI / 2);
  // taper: front view is 170 wide at the floor and ~130 at the top
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i), x = pos.getX(i);
    pos.setX(i, x * (1 - 0.235 * (y / H)));
  }
  geo.computeVertexNormals();
  const g = new THREE.Group(); g.name = 'Counter';
  const body = new THREE.Mesh(geo, M.white); body.castShadow = true; body.receiveShadow = true; g.add(body);
  // top slab, blue LED outline on front face
  const edge = (pts) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.008, 6, false), M.ledBlue));
  };
  const arcPts = (y, r, k) => { const a = []; for (let i = 0; i <= N; i++) { const t = -half + 2 * half * i / N; a.push(new THREE.Vector3(r * Math.sin(t) * k, y, r * Math.cos(t))); } return a; };
  edge(arcPts(0.015, Ro + 0.006, 1));
  edge(arcPts(H - 0.015, Ro + 0.006, 1 - 0.235 * ((H - 0.015) / H)));
  const sideLine = (sgn) => {
    const a0 = sgn * half;
    edge([new THREE.Vector3(Ro * Math.sin(a0), 0.015, Ro * Math.cos(a0) + 0.006),
      new THREE.Vector3(Ro * Math.sin(a0) * (1 - 0.235 * 0.5), H / 2, Ro * Math.cos(a0) + 0.006),
      new THREE.Vector3(Ro * Math.sin(a0) * (1 - 0.235 * (H - 0.015) / H), H - 0.015, Ro * Math.cos(a0) + 0.006)]);
  };
  sideLine(1); sideLine(-1);
  // logos on the front: SMS (left), Amphicos (right); SMT moved to the back wall
  const putLogo = (t, w, asp, ang, name) => {
    const m = logoPlane(t, w, asp, M);
    m.position.set((Ro + 0.004) * Math.sin(ang), 0.6, (Ro + 0.004) * Math.cos(ang));
    m.rotation.y = ang; m.name = name; g.add(m); return m;
  };
  putLogo(tex.logoSms, 0.44, LOGO_ASPECT.sms, -0.205, 'Logo_SMS_Counter');
  putLogo(tex.logoAmphicos, 0.44, LOGO_ASPECT.amphicos, 0.205, 'Logo_Amphicos_Counter');
  g.position.set(rc.x, FLOOR_Y, rc.z);
  // colliders: three boxes along the arc
  const colliders = [];
  for (const a of [-half * 0.66, 0, half * 0.66]) {
    const rm = (Ro + Ri * 0.98) / 2;
    colliders.push({ type: 'obb', cx: rc.x + rm * Math.sin(a), cz: rc.z + rm * Math.cos(a), hx: 0.34, hz: 0.3, rot: a });
  }
  return { group: g, colliders };
}
