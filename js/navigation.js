// Walkthrough navigation: keyboard + pointer lock on desktop, virtual joystick + drag-look on touch.
// 2D collision against oriented boxes and circles on the floor plane.
import * as THREE from 'three';
import { STAND, FLOOR_Y } from './booth.js';

export const EYE = 1.65;           // eye height above the surface you stand on
const RADIUS = 0.24;               // body radius for collisions
const SPEED = 1.6;                 // m/s walking
const BOUNDS = { minX: -9, maxX: 9, minZ: -STAND.d / 2 + 0.02, maxZ: 11 };

export class Walker {
  constructor(camera, dom, colliders) {
    this.camera = camera; this.dom = dom; this.colliders = colliders;
    this.enabled = false;
    this.yaw = 0; this.pitch = 0;
    this.keys = new Set();
    this.move = new THREE.Vector2();   // joystick vector (x right, y forward)
    this.locked = false;
    this.onLockChange = () => {};
    this._bind();
  }
  groundAt(x, z) {
    return (Math.abs(x) <= STAND.w / 2 && Math.abs(z) <= STAND.d / 2) ? FLOOR_Y : 0;
  }
  enter(pos, yaw) {
    this.enabled = true;
    this.yaw = yaw ?? this.yaw; this.pitch = 0;
    const p = this.resolve(pos.x, pos.z);
    this.camera.position.set(p.x, this.groundAt(p.x, p.z) + EYE, p.z);
    this.applyRotation();
  }
  exit() { this.enabled = false; this.keys.clear(); this.move.set(0, 0); if (document.pointerLockElement) document.exitPointerLock?.(); }
  applyRotation() {
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
  requestLock() {
    try {
      const r = this.dom.requestPointerLock?.();
      if (r && r.catch) r.catch(() => {});
    } catch (e) { /* pointer lock unavailable; drag-to-look still works */ }
  }
  _bind() {
    document.addEventListener('keydown', e => {
      if (!this.enabled || e.target.closest?.('input,select,textarea')) return;
      this.keys.add(e.code);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    });
    document.addEventListener('keyup', e => this.keys.delete(e.code));
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.dom;
      this.onLockChange(this.locked);
    });
    document.addEventListener('mousemove', e => {
      if (!this.enabled || !this.locked) return;
      this.look(e.movementX, e.movementY, 0.0022);
    });
    // drag to look (mouse without lock, and touch on the right side of the screen)
    let drag = null;
    this.dom.addEventListener('pointerdown', e => {
      if (!this.enabled || this.locked) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointermove', e => {
      if (!drag || drag.id !== e.pointerId) return;
      this.look(e.clientX - drag.x, e.clientY - drag.y, e.pointerType === 'touch' ? 0.005 : 0.004);
      drag.x = e.clientX; drag.y = e.clientY;
    });
    window.addEventListener('pointerup', e => { if (drag && drag.id === e.pointerId) drag = null; });
    window.addEventListener('pointercancel', () => { drag = null; });
  }
  look(dx, dy, k) {
    this.yaw -= dx * k;
    this.pitch = THREE.MathUtils.clamp(this.pitch - dy * k, -1.35, 1.35);
    this.applyRotation();
  }
  update(dt) {
    if (!this.enabled) return;
    let f = 0, s = 0;
    const K = this.keys;
    if (K.has('KeyW') || K.has('ArrowUp')) f += 1;
    if (K.has('KeyS') || K.has('ArrowDown')) f -= 1;
    if (K.has('KeyD') || K.has('ArrowRight')) s += 1;
    if (K.has('KeyA') || K.has('ArrowLeft')) s -= 1;
    f += this.move.y; s += this.move.x;
    const len = Math.hypot(f, s);
    if (len > 1) { f /= len; s /= len; }
    const speed = SPEED * (K.has('ShiftLeft') || K.has('ShiftRight') ? 1.8 : 1);
    if (len > 0.01) {
      const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
      // forward is -Z rotated by yaw
      const dx = (-sin * f + cos * s) * speed * dt;
      const dz = (-cos * f - sin * s) * speed * dt;
      const p = this.resolve(this.camera.position.x + dx, this.camera.position.z + dz);
      this.camera.position.x = p.x; this.camera.position.z = p.z;
    }
    const target = this.groundAt(this.camera.position.x, this.camera.position.z) + EYE;
    this.camera.position.y += (target - this.camera.position.y) * Math.min(1, dt * 10);
  }
  // push a circle out of every collider (a few iterations for corners)
  resolve(x, z) {
    for (let iter = 0; iter < 3; iter++) {
      for (const c of this.colliders) {
        if (c.type === 'circle') {
          const dx = x - c.cx, dz = z - c.cz, d = Math.hypot(dx, dz), min = c.r + RADIUS;
          if (d < min && d > 1e-6) { x = c.cx + dx / d * min; z = c.cz + dz / d * min; }
        } else {
          const cos = Math.cos(c.rot), sin = Math.sin(c.rot);
          const wx = x - c.cx, wz = z - c.cz;
          // world -> local (inverse of three.js rotation.y)
          const lx = wx * cos - wz * sin, lz = wx * sin + wz * cos;
          const qx = THREE.MathUtils.clamp(lx, -c.hx, c.hx), qz = THREE.MathUtils.clamp(lz, -c.hz, c.hz);
          let ddx = lx - qx, ddz = lz - qz, d = Math.hypot(ddx, ddz);
          let nlx = lx, nlz = lz;
          if (d < RADIUS) {
            if (d < 1e-6) { // centre inside the box: exit along the shallowest axis
              const px = c.hx - Math.abs(lx), pz = c.hz - Math.abs(lz);
              if (px < pz) nlx = Math.sign(lx || 1) * (c.hx + RADIUS); else nlz = Math.sign(lz || 1) * (c.hz + RADIUS);
            } else { nlx = qx + ddx / d * RADIUS; nlz = qz + ddz / d * RADIUS; }
            // local -> world
            x = c.cx + nlx * cos + nlz * sin;
            z = c.cz - nlx * sin + nlz * cos;
          }
        }
      }
      x = THREE.MathUtils.clamp(x, BOUNDS.minX, BOUNDS.maxX);
      z = THREE.MathUtils.clamp(z, BOUNDS.minZ + RADIUS, BOUNDS.maxZ);
    }
    return { x, z };
  }
}

// On-screen joystick for touch walkthrough
export function makeJoystick(el, onMove) {
  const knob = el.querySelector('.knob');
  let id = null, cx = 0, cy = 0;
  const R = 46;
  const set = (dx, dy) => {
    const d = Math.hypot(dx, dy), k = d > R ? R / d : 1;
    dx *= k; dy *= k;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    onMove(dx / R, -dy / R);
  };
  el.addEventListener('pointerdown', e => {
    id = e.pointerId; el.setPointerCapture(id);
    const r = el.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    set(e.clientX - cx, e.clientY - cy); e.preventDefault(); e.stopPropagation();
  });
  el.addEventListener('pointermove', e => { if (e.pointerId === id) set(e.clientX - cx, e.clientY - cy); });
  const end = e => { if (e.pointerId === id) { id = null; knob.style.transform = ''; onMove(0, 0); } };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
}
