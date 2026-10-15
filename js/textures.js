// Texture loading and procedural canvas textures.
import * as THREE from 'three';

const TEX_DIR = 'assets/textures/';

export const TEXTURE_FILES = {
  vwLeft1: 'vw_left_1.jpg', vwLeft2: 'vw_left_2.jpg', vwLeft3: 'vw_left_3.jpg', vwLeft4: 'vw_left_4.jpg',
  vwRight1: 'vw_right_1.jpg', vwRight2: 'vw_right_2.jpg', vwRight3: 'vw_right_3.jpg', vwRight4: 'vw_right_4.jpg',
  tvSms: 'tv_sms.jpg',
  tvAmphicos: 'tv_amphicos.jpg',
  lightbox: 'lightbox.jpg',
  logoSms: 'logo_sms.png',
  logoAmphicos: 'logo_amphicos.png',
  logoSmt: 'logo_smt.png',
  logoMt: 'logo_mt.png',
  logoNavis: 'logo_navis.png',
  logoFugro: 'logo_fugro.png',
  logoSonardyne: 'logo_sonardyne.png',
  logoGuidance: 'logo_guidance.png',
  logoXplisi: 'logo_xplisi.png',
  logoSmtUk: 'logo_smt_uk.png',
  mtScreen: 'mt_screen.jpg',
  navisScreen: 'navis_screen.jpg',
  navisPanel: 'navis_panel.jpg',
  fugroRxFront: 'fugro_rx_front.jpg',
  fugroDisplay: 'fugro_display.jpg',
  sonardyneBand: 'sonardyne_band.jpg',
};

export function loadTextures(renderer, manager) {
  const loader = new THREE.TextureLoader(manager);
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const tex = {};
  for (const [key, file] of Object.entries(TEXTURE_FILES)) {
    const t = loader.load(TEX_DIR + file);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = aniso;
    tex[key] = t;
  }
  tex.ledBand = ledBandTexture();
  tex.mtPanel = mtPanelTexture();
  tex.floor = hallFloorTexture();
  for (const k of ['ledBand', 'mtPanel', 'floor']) tex[k].anisotropy = aniso;
  return tex;
}

// Flexible screen around the canopy: blue LED field with rows of white dots, as in the renders.
function ledBandTexture() {
  const w = 4096, h = 292;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1aa3e6'); grad.addColorStop(0.5, '#1592d6'); grad.addColorStop(1, '#0e7cc0');
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,0.92)';
  const rows = 6;
  for (let r = 0; r < rows; r++) {
    const y = (r + 0.5) * h / rows;
    const step = 46;
    const off = (r % 2) * step / 2;
    for (let x = off; x < w; x += step) {
      g.beginPath(); g.ellipse(x, y, 9, 4.2, 0, 0, Math.PI * 2); g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

// MT control desk: grey plate, rows of backlit keys, rotary knob and keypad (drawn from the console photo layout).
function mtPanelTexture() {
  const w = 1024, h = 560;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#2b2e33'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#383c42'; g.fillRect(24, 24, w - 48, h - 48);
  const key = (x, y, kw = 46, kh = 18) => {
    g.fillStyle = '#1d2024'; g.fillRect(x - 2, y - 2, kw + 4, kh + 4);
    g.fillStyle = '#9cc7ee'; g.fillRect(x, y, kw, kh);
  };
  for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) key(330 + i * 58, 120 + r * 70);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 2; i++) key(640 + i * 58, 120 + r * 70);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 3; i++) key(800 + i * 52, 200 + r * 56, 34, 26);
  g.fillStyle = '#1d2024'; g.beginPath(); g.arc(170, 220, 70, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e9ecef'; g.beginPath(); g.arc(170, 220, 46, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#9cc7ee';
  for (let i = 0; i < 4; i++) { g.save(); g.translate(170, 400); g.rotate(i * Math.PI / 2); g.fillRect(-12, -70, 24, 44); g.restore(); }
  g.fillStyle = '#c9d0d6'; g.font = 'bold 22px Arial'; g.fillText('MT  DP CONTROL', 340, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Exhibition hall floor: dark polished concrete with faint tile joints.
function hallFloorTexture() {
  const s = 1024;
  const c = document.createElement('canvas'); c.width = s; c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = '#16191e'; g.fillRect(0, 0, s, s);
  const img = g.getImageData(0, 0, s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 2;
  g.strokeRect(1, 1, s - 2, s - 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(30, 30);
  return t;
}
