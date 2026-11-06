/*
 * worldGrid — peta tabrakan 2D ringan (sel 1 m) untuk lapisan kota.
 *
 * Diisi sekali oleh <StaticBatch registerBlockers> dari kotak pembatas (AABB) setiap mesh.
 * Dipakai ZoneScene untuk:
 *   - solidAt(x, z)     : pemain tidak menembus dinding bangunan / kendaraan parkir.
 *   - cameraBlocked(...) : kamera maju mendekat bila terhalang gedung (gaya kamera Roblox).
 *   - footprint         : jejak bangunan untuk digambar di minimap (lapisan kota & lapisan peta inti).
 * Jauh lebih murah daripada raycast ke ribuan segitiga setiap frame.
 */

const HALF = 110;
const SIZE = HALF * 2;
const lo = new Float32Array(SIZE * SIZE).fill(Infinity);
const hi = new Float32Array(SIZE * SIZE).fill(-Infinity);
const solid = new Uint8Array(SIZE * SIZE);
// Bit 1 = bangunan kota sekitar, bit 2 = bangunan inti peta BAB.
const footprint = new Uint8Array(SIZE * SIZE);
export const FOOTPRINT_TOWN = 1;
export const FOOTPRINT_CORE = 2;
let version = 0;
export const GRID_HALF = HALF;
export const GRID_SIZE = SIZE;

// Bentuk organik (daun, batu, asap, awan) tidak dihitung sebagai penghalang.
const SOFT_GEOMETRY = new Set(['IcosahedronGeometry', 'DodecahedronGeometry', 'SphereGeometry', 'ConeGeometry', 'OctahedronGeometry', 'TorusGeometry']);

function idx(x, z) {
    const ix = Math.floor(x + HALF);
    const iz = Math.floor(z + HALF);
    if (ix < 0 || iz < 0 || ix >= SIZE || iz >= SIZE) return -1;
    return iz * SIZE + ix;
}

export function clearWorldGrid() {
    lo.fill(Infinity);
    hi.fill(-Infinity);
    solid.fill(0);
    clearFootprint(FOOTPRINT_TOWN);
}

/** Versi data grid — naik setiap kali isi berubah (dipakai minimap untuk menggambar ulang). */
export function gridVersion() {
    return version;
}

export function getFootprint() {
    return footprint;
}

export function clearFootprint(bit) {
    for (let i = 0; i < footprint.length; i += 1) footprint[i] &= ~bit;
    version += 1;
}

function isBuildingBox(box) {
    const w = box.max.x - box.min.x;
    const d = box.max.z - box.min.z;
    return box.min.y < 1.5 && box.max.y > 2.2 && box.max.y - box.min.y > 1.5 && w * d >= 3 && w >= 0.8 && d >= 0.8 && w * d < 900;
}

/** Catat jejak bangunan (hanya untuk minimap, tanpa tabrakan). */
export function registerFootprint(box, geometryType, bit) {
    if (SOFT_GEOMETRY.has(geometryType) || !isBuildingBox(box)) return;
    const x0 = Math.max(-HALF, Math.floor(box.min.x));
    const x1 = Math.min(HALF - 1, Math.floor(box.max.x - 0.001));
    const z0 = Math.max(-HALF, Math.floor(box.min.z));
    const z1 = Math.min(HALF - 1, Math.floor(box.max.z - 0.001));
    for (let z = z0; z <= z1; z += 1) {
        for (let x = x0; x <= x1; x += 1) {
            const i = idx(x + 0.5, z + 0.5);
            if (i >= 0) footprint[i] |= bit;
        }
    }
    version += 1;
}

/** Daftarkan satu mesh (box sudah dalam koordinat dunia). */
export function registerBox(box, geometryType) {
    if (SOFT_GEOMETRY.has(geometryType)) {
        registerCameraBlock(box, geometryType); // tajuk pohon kota
        return;
    }
    registerFootprint(box, geometryType, FOOTPRINT_TOWN);
    const w = box.max.x - box.min.x;
    const d = box.max.z - box.min.z;
    const area = w * d;
    const isSolid = box.min.y < 1 && box.max.y > 0.9 && area >= 1.5 && w >= 0.5 && d >= 0.5;
    // Pelat tipis (atap teras, kanopi, balkon) tidak menghalangi kamera.
    const isCam = box.min.y < 8 && box.max.y > 2.5 && box.max.y - box.min.y > 0.5 && area >= 2 && w >= 0.4 && d >= 0.4;
    if (!isSolid && !isCam) return;
    const x0 = Math.max(-HALF, Math.floor(box.min.x));
    const x1 = Math.min(HALF - 1, Math.floor(box.max.x - 0.001));
    const z0 = Math.max(-HALF, Math.floor(box.min.z));
    const z1 = Math.min(HALF - 1, Math.floor(box.max.z - 0.001));
    for (let z = z0; z <= z1; z += 1) {
        for (let x = x0; x <= x1; x += 1) {
            const i = idx(x + 0.5, z + 0.5);
            if (i < 0) continue;
            if (isSolid) solid[i] = 1;
            if (isCam) {
                if (box.min.y < lo[i]) lo[i] = box.min.y;
                if (box.max.y > hi[i]) hi[i] = box.max.y;
            }
        }
    }
}

/**
 * Daftarkan penghalang kamera saja (tanpa tabrakan pemain): bangunan inti peta BAB & tajuk pohon.
 * Kamera akan maju mendekat alih-alih masuk ke dalam gedung/daun.
 */
export function registerCameraBlock(box, geometryType) {
    const w = box.max.x - box.min.x;
    const d = box.max.z - box.min.z;
    const h = box.max.y - box.min.y;
    const soft = SOFT_GEOMETRY.has(geometryType);
    if (soft && (geometryType === 'SphereGeometry' || geometryType === 'TorusGeometry' || box.max.y > 12)) return; // awan, asap, cincin hologram
    if (h < (soft ? 0.8 : 0.5) || w * d < (soft ? 1 : 2) || w < 0.4 || d < 0.4 || w * d > 900) return;
    if (box.max.y < 2.5 || box.min.y > 14) return;
    const x0 = Math.max(-HALF, Math.floor(box.min.x));
    const x1 = Math.min(HALF - 1, Math.floor(box.max.x - 0.001));
    const z0 = Math.max(-HALF, Math.floor(box.min.z));
    const z1 = Math.min(HALF - 1, Math.floor(box.max.z - 0.001));
    for (let z = z0; z <= z1; z += 1) {
        for (let x = x0; x <= x1; x += 1) {
            const i = idx(x + 0.5, z + 0.5);
            if (i < 0) continue;
            if (box.min.y < lo[i]) lo[i] = box.min.y;
            if (box.max.y > hi[i]) hi[i] = box.max.y;
        }
    }
}

/** Apakah lingkaran pemain (radius r) bersentuhan dengan sel padat? */
export function solidAt(x, z, r = 0.4) {
    const pts = [[x - r, z - r], [x + r, z - r], [x - r, z + r], [x + r, z + r]];
    for (const [px, pz] of pts) {
        const i = idx(px, pz);
        if (i >= 0 && solid[i]) return true;
    }
    return false;
}

/** Apakah titik (x, y, z) berada di dalam volume bangunan (untuk kamera)? */
export function cameraBlocked(x, y, z) {
    const i = idx(x, z);
    if (i < 0) return false;
    return y > lo[i] - 0.3 && y < hi[i] + 0.4;
}
