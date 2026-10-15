// Stand 15288 virtual walkthrough: scene setup, camera modes, inspection, UI and WebXR.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { loadTextures } from './textures.js';
import { buildBooth, makeMaterials, STAND, FLOOR_Y, HEADER_Y, P } from './booth.js';
import { buildEquipment, EQUIPMENT } from './equipment.js';
import { Walker, makeJoystick, EYE } from './navigation.js';

const $ = (s) => document.querySelector(s);
const isTouch = matchMedia('(pointer: coarse)').matches;
const lowPower = isTouch || (navigator.hardwareConcurrency || 8) <= 4;

// ---------- renderer / scene ----------
const canvasHost = $('#viewport');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
renderer.setSize(canvasHost.clientWidth, canvasHost.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.75;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true;
canvasHost.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(canvasHost.clientWidth, canvasHost.clientHeight);
labelRenderer.domElement.className = 'labels-layer';
canvasHost.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0d12);
scene.fog = new THREE.Fog(0x0a0d12, 22, 60);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
scene.environmentIntensity = 0.4;

const camera = new THREE.PerspectiveCamera(50, canvasHost.clientWidth / canvasHost.clientHeight, 0.05, 200);

// ---------- lights ----------
scene.add(new THREE.HemisphereLight(0xdfefff, 0x1b2430, 0.4));
const key = new THREE.DirectionalLight(0xffffff, 1.25);
key.position.set(4, 9, 7); key.castShadow = true;
key.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 25 });
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
scene.add(key);
const fill = new THREE.DirectionalLight(0xbfdfff, 0.35); fill.position.set(-6, 5, -2); scene.add(fill);
// canopy downlights (a few real spots; the rest are emissive discs)
for (const [x, z] of [[-1.2, 1.0], [1.2, 1.0], [0, 1.9], [0, 0.4]]) {
  const s = new THREE.SpotLight(0xfff4e6, 4, 6, 0.75, 0.6, 1.4);
  s.position.set(x, HEADER_Y - 0.02, z); s.target.position.set(x, 0, z + 0.1);
  scene.add(s, s.target);
}
// wash lights on back-wall corners where the consoles stand
for (const sx of [-1, 1]) {
  const s = new THREE.SpotLight(0xffffff, 3, 5, 0.6, 0.7, 1.2);
  s.position.set(sx * 2.0, HEADER_Y, -0.8); s.target.position.set(sx * 2.3, FLOOR_Y + 0.8, -1.8);
  scene.add(s, s.target);
}

// ---------- load content ----------
const manager = new THREE.LoadingManager();
manager.onProgress = (_u, loaded, total) => { $('#loadbar').style.width = `${Math.round(loaded / total * 100)}%`; };
manager.onLoad = () => { $('#loader').classList.add('done'); setTimeout(() => $('#loader').hidden = true, 600); };
manager.onError = (u) => console.warn('Could not load', u);
const tex = loadTextures(renderer, manager);
const M = makeMaterials(tex);
const { booth, roof, colliders, counter, smtLogo } = buildBooth(tex, M);
scene.add(booth);
const eq = buildEquipment(tex, M, roof);
scene.add(eq.root);
colliders.push(...eq.colliders);
// SMT logo (back wall) is selectable as item 5
eq.items.smt = { group: smtLogo, focusHeight: 0.8, facing: 0, dist: 2.2, focusOverride: smtLogo };

// ---------- post-processing (desktop only; XR renders directly) ----------
let composer = null;
if (!lowPower) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(canvasHost.clientWidth, canvasHost.clientHeight), 0.15, 0.4, 0.97));
  composer.addPass(new OutputPass());
}

// ---------- controls ----------
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true; orbit.dampingFactor = 0.08;
orbit.minDistance = 0.6; orbit.maxDistance = 22;
orbit.maxPolarAngle = Math.PI * 0.495;
orbit.target.set(0, 1.4, 0);
const walker = new Walker(camera, renderer.domElement, colliders);
let mode = 'orbit';

// ---------- camera presets ----------
const PRESETS = {
  overview: { pos: [8.2, 5.6, 9.4], target: [0, 1.4, 0], label: 'Overview' },
  front: { pos: [0, 1.75, 9.0], target: [0, 1.75, 0], label: 'Front entrance' },
  top: { pos: [0, 12.5, 0.01], target: [0, 0, 0], label: 'Top-down plan', plan: true },
  left: { pos: [-9.0, 2.3, 0.6], target: [0, 1.5, 0], label: 'Left side (Sinor Marine)' },
  right: { pos: [9.0, 2.3, 0.6], target: [0, 1.5, 0], label: 'Right side (Amphicos)' },
  interior: { walk: { x: 0, z: 1.25, yaw: 0 }, label: 'Interior walkthrough' },
};

let tween = null;
function flyTo(pos, target, dur = 1.1) {
  tween = { t: 0, dur, p0: camera.position.clone(), p1: new THREE.Vector3(...pos), q0: orbit.target.clone(), q1: new THREE.Vector3(...target) };
}
function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function setMode(m) {
  mode = m;
  document.body.dataset.mode = m;
  $('#mode-orbit').setAttribute('aria-pressed', m === 'orbit');
  $('#mode-walk').setAttribute('aria-pressed', m === 'walk');
  if (m === 'walk') {
    tween = null; orbit.enabled = false;
    setPlan(false);
    const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd);
    const inside = Math.abs(camera.position.x) < 8 && camera.position.z < 10 && camera.position.y < 4;
    const start = inside ? { x: camera.position.x, z: camera.position.z } : { x: 0, z: 4.2 };
    walker.enter(start, inside ? Math.atan2(-fwd.x, -fwd.z) : 0);
    hint(isTouch ? 'Left stick to move, drag to look' : 'Click the view to look with the mouse. W A S D to move, Esc to release');
  } else {
    walker.exit();
    orbit.enabled = true;
    const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd);
    orbit.target.copy(camera.position).addScaledVector(fwd, 2.5);
    orbit.update();
  }
}

function applyPreset(name) {
  const p = PRESETS[name];
  deselect();
  if (p.walk) {
    setMode('walk');
    walker.enter({ x: p.walk.x, z: p.walk.z }, p.walk.yaw);
    return;
  }
  if (mode !== 'orbit') setMode('orbit');
  setPlan(!!p.plan);
  flyTo(p.pos, p.target);
}

// ---------- plan view (hide header, canopy and hanging logos) ----------
let planOn = false;
function setPlan(on) {
  planOn = on; roof.visible = !on;
  $('#tg-plan').setAttribute('aria-pressed', on);
}

// ---------- labels ----------
const labelObjs = [];
function makeLabel(text, cls = 'tag') {
  const d = document.createElement('div'); d.className = cls; d.textContent = text;
  const o = new CSS2DObject(d); return o;
}
for (const e of EQUIPMENT) {
  const it = eq.items[e.id]; if (!it) continue;
  const lab = makeLabel(`${e.num}  ${e.short}`);
  lab.element.dataset.id = e.id;
  lab.element.addEventListener('click', () => select(e.id));
  const b = new THREE.Box3().setFromObject(it.focusOverride || it.group);
  const c = b.getCenter(new THREE.Vector3());
  lab.position.set(c.x, b.max.y + 0.25, c.z);
  scene.add(lab); labelObjs.push(lab);
}
function setLabels(on) {
  labelObjs.forEach(l => l.visible = on);
  $('#tg-labels').setAttribute('aria-pressed', on);
}

// ---------- dimension overlay ----------
const dims = new THREE.Group(); dims.visible = false; scene.add(dims);
{
  const mat = new THREE.LineBasicMaterial({ color: 0xffb347, depthTest: false, transparent: true });
  const line = (a, b, text, lp) => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]);
    const l = new THREE.Line(g, mat); l.renderOrder = 10; dims.add(l);
    const lab = makeLabel(text, 'dim'); lab.position.set(...(lp || [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2])); dims.add(lab);
  };
  const y = 0.12, o = 0.35;
  line([-3, y, 2.5 + o], [3, y, 2.5 + o], '6.00 m  stand width');
  line([3 + o, y, -2.5], [3 + o, y, 2.5], '5.00 m  depth');
  line([-3 - o, 0, -2.5], [-3 - o, 4.0, -2.5], 'H 4.00 m overall');
  line([3 + 0.15, FLOOR_Y, -2.45], [3 + 0.15, HEADER_Y, -2.45], 'H 3.30 m walls');
  line([-2.325, HEADER_Y - 0.05, 0.1], [2.325, HEADER_Y - 0.05, 0.1], 'Canopy Ø 4.65 m', [0, HEADER_Y - 0.15, 0.1]);
  const mt = P(75, 425), nv = P(525, 425);
  line([mt.x, FLOOR_Y, mt.z], [mt.x, FLOOR_Y + 1.205, mt.z], 'MT 653.5 × 685.9 × H1205 mm', [mt.x, FLOOR_Y + 1.45, mt.z]);
  line([nv.x, FLOOR_Y, nv.z], [nv.x, FLOOR_Y + 1.205, nv.z], 'NAVIS 653.5 × 685.9 × H1205 mm', [nv.x, FLOOR_Y + 1.45, nv.z]);
  const fg = P(37, 230), sn = P(563, 230);
  line([fg.x, FLOOR_Y + 0.96, fg.z - 0.5], [fg.x, FLOOR_Y + 0.96, fg.z + 0.5], 'Table 1000 × 500 × H950', [fg.x - 0.2, FLOOR_Y + 1.4, fg.z]);
  line([sn.x, FLOOR_Y + 0.96, sn.z - 0.5], [sn.x, FLOOR_Y + 0.96, sn.z + 0.5], 'Table 1000 × 500 × H950', [sn.x + 0.2, FLOOR_Y + 1.4, sn.z]);
  line([-0.85, FLOOR_Y + 1.0, 2.5], [0.85, FLOOR_Y + 1.0, 2.5], 'Counter 1.70 × 0.50 × H0.95');
}
function setDims(on) { dims.visible = on; dims.traverse(o => { if (o.isCSS2DObject) o.visible = on; }); $('#tg-dims').setAttribute('aria-pressed', on); }

// ---------- selection / inspection ----------
const selBox = new THREE.Box3Helper(new THREE.Box3(), 0x3fc4ff); selBox.visible = false; selBox.material.depthTest = false; selBox.renderOrder = 11; scene.add(selBox);
const selRing = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.56, 64), new THREE.MeshBasicMaterial({ color: 0x3fc4ff, transparent: true, opacity: 0.85, toneMapped: false }));
selRing.rotation.x = -Math.PI / 2; selRing.visible = false; scene.add(selRing);
let selected = null;

function select(id) {
  const it = eq.items[id]; const e = EQUIPMENT.find(x => x.id === id);
  if (!it || !e) return;
  if (mode === 'walk') setMode('orbit');
  setPlan(false);
  selected = id;
  const obj = it.focusOverride || it.group;
  const b = new THREE.Box3().setFromObject(obj);
  if (id === 'smt') b.expandByScalar(0.05);
  selBox.box.copy(b); selBox.visible = true;
  const c = b.getCenter(new THREE.Vector3());
  selRing.position.set(c.x, FLOOR_Y + 0.006, c.z); selRing.visible = id !== 'smt';
  const size = b.getSize(new THREE.Vector3());
  const r = Math.max(size.x, size.z) * 0.6 + 0.15; selRing.scale.setScalar(r / 0.53);
  // camera in front of the item, along its facing direction
  const dir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), it.facing);
  const target = new THREE.Vector3(c.x, id === 'smt' ? c.y : FLOOR_Y + it.focusHeight, c.z);
  const pos = target.clone().addScaledVector(dir, it.dist).add(new THREE.Vector3(0, 0.55, 0));
  flyTo(pos.toArray(), target.toArray());
  // panel
  $('#info-num').textContent = e.num;
  $('#info-name').textContent = e.name;
  $('#info-ident').textContent = e.ident;
  $('#info-dims').textContent = e.dims;
  $('#info-src').textContent = e.dimsSource === 'verified' ? 'From requirements document' : 'Assumed, awaiting datasheet';
  $('#info-src').dataset.kind = e.dimsSource;
  $('#info-pos').textContent = e.position;
  $('#info-logo').textContent = e.logo;
  $('#info-power').textContent = e.power;
  $('#info').hidden = false;
  document.querySelectorAll('#eq-list button').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === id));
  document.querySelectorAll('.tag').forEach(t => t.classList.toggle('on', t.dataset.id === id));
}
function deselect() {
  selected = null; selBox.visible = false; selRing.visible = false; $('#info').hidden = true;
  document.querySelectorAll('#eq-list button').forEach(b => b.setAttribute('aria-pressed', 'false'));
  document.querySelectorAll('.tag').forEach(t => t.classList.remove('on'));
}

// click picking (ignore drags)
const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
const pickables = Object.entries(eq.items).map(([id, it]) => { const o = it.focusOverride || it.group; o.userData.selectId = id; return o; });
let down = null;
renderer.domElement.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
  const r = renderer.domElement.getBoundingClientRect();
  if (mode === 'walk' && walker.locked) ndc.set(0, 0);
  else ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(pickables, true);
  for (const h of hits) {
    let o = h.object; while (o && !o.userData.selectId) o = o.parent;
    if (o) { if (walker.locked) document.exitPointerLock?.(); select(o.userData.selectId); return; }
    break;
  }
  if (mode === 'walk' && !isTouch && !walker.locked) walker.requestLock();
});

// ---------- UI wiring ----------
function hint(text) {
  const h = $('#hint'); h.textContent = text; h.classList.add('show');
  clearTimeout(hint._t); hint._t = setTimeout(() => h.classList.remove('show'), 4200);
}
$('#mode-orbit').onclick = () => setMode('orbit');
$('#mode-walk').onclick = () => { deselect(); setMode('walk'); };
$('#preset').onchange = (e) => { const v = e.target.value; if (v.startsWith('eq:')) select(v.slice(3)); else applyPreset(v); e.target.blur(); };
$('#zoom-in').onclick = () => zoom(0.75);
$('#zoom-out').onclick = () => zoom(1.33);
function zoom(k) {
  if (mode === 'walk') { camera.fov = THREE.MathUtils.clamp(camera.fov * k, 25, 75); camera.updateProjectionMatrix(); return; }
  const off = camera.position.clone().sub(orbit.target).multiplyScalar(k);
  const len = THREE.MathUtils.clamp(off.length(), orbit.minDistance, orbit.maxDistance);
  off.setLength(len);
  flyTo(orbit.target.clone().add(off).toArray(), orbit.target.toArray(), 0.4);
}
$('#reset').onclick = () => { camera.fov = 50; camera.updateProjectionMatrix(); $('#preset').value = 'overview'; applyPreset('overview'); };
$('#tg-labels').onclick = (e) => setLabels(e.currentTarget.getAttribute('aria-pressed') !== 'true');
$('#tg-dims').onclick = (e) => setDims(e.currentTarget.getAttribute('aria-pressed') !== 'true');
$('#tg-plan').onclick = () => { if (!planOn) { $('#preset').value = 'top'; applyPreset('top'); } else { setPlan(false); $('#preset').value = 'overview'; applyPreset('overview'); } };
$('#fullscreen').onclick = () => {
  const el = document.documentElement;
  if (!document.fullscreenElement) { const r = el.requestFullscreen?.(); r?.catch?.(() => hint('Full screen is not available in this view')); if (!el.requestFullscreen) hint('Full screen is not available in this view'); }
  else document.exitFullscreen?.();
};
$('#help-btn').onclick = () => { $('#help').hidden = !$('#help').hidden; };
$('#help-close').onclick = () => { $('#help').hidden = true; };
$('#info-close').onclick = () => { deselect(); applyPreset('overview'); $('#preset').value = 'overview'; };
$('#info-back').onclick = () => { deselect(); applyPreset('overview'); $('#preset').value = 'overview'; };
$('#eq-toggle').onclick = () => { const p = $('#eq-panel'); p.hidden = !p.hidden; $('#eq-toggle').setAttribute('aria-expanded', !p.hidden); };
for (const e of EQUIPMENT) {
  const b = document.createElement('button'); b.dataset.id = e.id; b.setAttribute('aria-pressed', 'false');
  b.innerHTML = `<span class="n">${e.num}</span><span>${e.name}</span>`;
  b.onclick = () => { select(e.id); if (innerWidth < 720) { $('#eq-panel').hidden = true; } };
  $('#eq-list').appendChild(b);
  const o = document.createElement('option'); o.value = 'eq:' + e.id; o.textContent = `${e.num} · ${e.name}`; $('#preset-eq').appendChild(o);
}
walker.onLockChange = (locked) => document.body.classList.toggle('locked', locked);
document.addEventListener('keydown', e => {
  if (e.target.closest?.('input,select,textarea')) return;
  if (e.key === 'Escape' && mode === 'orbit' && selected) { deselect(); }
  if (e.key === 'l' || e.key === 'L') $('#tg-labels').click();
});
makeJoystick($('#joystick'), (x, y) => walker.move.set(x, y));
renderer.domElement.addEventListener('wheel', e => { if (mode === 'walk') { e.preventDefault(); zoom(e.deltaY > 0 ? 1.08 : 0.92); } }, { passive: false });

// ---------- WebXR ----------
let xrRig = null;
const vrBtn = VRButton.createButton(renderer);
vrBtn.id = 'vr-button'; vrBtn.removeAttribute('style');
$('#vr-slot').appendChild(vrBtn);
const vrState = () => vrBtn.classList.toggle('off', /NOT|NEEDS/i.test(vrBtn.textContent));
new MutationObserver(vrState).observe(vrBtn, { childList: true, characterData: true, subtree: true }); vrState();
renderer.xr.addEventListener('sessionstart', () => {
  xrRig = new THREE.Group(); xrRig.position.set(0, FLOOR_Y, 3.6); scene.add(xrRig); xrRig.add(camera);
  orbit.enabled = false; walker.exit(); roof.visible = true; dims.visible = false;
});
renderer.xr.addEventListener('sessionend', () => {
  xrRig.remove(camera); scene.remove(xrRig); xrRig = null;
  setMode('orbit'); applyPreset('overview');
});
function xrLocomotion(dt) {
  const session = renderer.xr.getSession(); if (!session || !xrRig) return;
  for (const src of session.inputSources) {
    const gp = src.gamepad; if (!gp || gp.axes.length < 4) continue;
    const ax = gp.axes[2], ay = gp.axes[3];
    if (Math.abs(ax) < 0.15 && Math.abs(ay) < 0.15) continue;
    if (src.handedness === 'right') { xrRig.rotation.y -= ax * dt * 1.2; continue; }
    const xrCam = renderer.xr.getCamera(); const fwd = new THREE.Vector3(); xrCam.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    const nx = xrRig.position.x + (fwd.x * -ay + right.x * ax) * dt * 1.4;
    const nz = xrRig.position.z + (fwd.z * -ay + right.z * ax) * dt * 1.4;
    const p = walker.resolve(nx, nz); xrRig.position.x = p.x; xrRig.position.z = p.z;
  }
}

// ---------- resize / loop ----------
function resize() {
  const w = canvasHost.clientWidth, h = canvasHost.clientHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h); labelRenderer.setSize(w, h); composer?.setSize(w, h);
}
addEventListener('resize', resize);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const raw = clock.getDelta(); const dt = Math.min(raw, 0.05);
  if (renderer.xr.isPresenting) { xrLocomotion(dt); renderer.render(scene, camera); return; }
  if (tween) {
    tween.t += Math.min(raw, 0.2); const k = ease(Math.min(1, tween.t / tween.dur));
    camera.position.lerpVectors(tween.p0, tween.p1, k);
    orbit.target.lerpVectors(tween.q0, tween.q1, k);
    if (tween.t >= tween.dur) tween = null;
  }
  if (mode === 'orbit') orbit.update(); else walker.update(dt);
  if (selRing.visible) selRing.material.opacity = 0.55 + 0.35 * Math.sin(clock.elapsedTime * 3);
  if (composer) composer.render(); else renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
});

// initial state
camera.position.set(...PRESETS.overview.pos); orbit.target.set(...PRESETS.overview.target); orbit.update();
setLabels(true); setDims(false); setPlan(false); setMode('orbit');
if (isTouch) document.body.classList.add('touch');
if (innerWidth < 720) { $('#eq-panel').hidden = true; $('#eq-toggle').setAttribute('aria-expanded', 'false'); }
// deep links: #top, #front, #walk, #mt, #navis, #fugro, #sonardyne, #smt
const h = location.hash.slice(1);
if (PRESETS[h]) { $('#preset').value = h; applyPreset(h); }
else if (h === 'walk') applyPreset('interior');
else if (eq.items[h]) setTimeout(() => select(h), 300);

// expose for testing and GLB export
window.__booth = { THREE, scene, booth, roof, eq, camera, renderer, orbit, select, applyPreset, setMode, setDims, setPlan, walker };
