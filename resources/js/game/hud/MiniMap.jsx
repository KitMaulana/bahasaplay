import React, { useEffect, useRef } from 'react';
import { Map as MapIcon, X } from 'lucide-react';
import { playerState } from '../lib/playerState';
import { TOWN_LAYOUT, townConfigFor } from '../world/Town';
import { getFootprint, gridVersion, GRID_HALF, GRID_SIZE, FOOTPRINT_CORE } from '../world/worldGrid';

/*
 * MiniMap — peta navigasi gaya GTA.
 * - Mode ringkas: bundar, berputar mengikuti arah kamera (atas = arah pandang), pemain di tengah,
 *   penanda zona belajar, garis rute ke tujuan aktif, penanda tepi bila tujuan di luar jangkauan.
 * - Mode penuh: peta utara-di-atas seluruh kawasan + legenda (buka dengan tombol peta / tombol M).
 * Peta dasar (jalan, plaza, jejak bangunan) digambar sekali ke canvas lalu diputar per frame.
 */

const PX_PER_M = 2; // resolusi peta dasar
const PALETTE = {
    ground: '#2f4f3a',
    groundRural: '#3f5f2a',
    water: '#1d6fa5',
    road: '#8b95a3',
    roadEdge: '#b8c1cc',
    dirt: '#a07a4a',
    plaza: '#5b6675',
    town: '#3b4656',
    core: '#9a6b2f',
    rice: '#6b8f3a',
};

/** Gambar peta dasar statis ke canvas offscreen. */
function buildBase(mapKey) {
    const cfg = townConfigFor(mapKey);
    const rural = cfg.style === 'rural';
    const L = TOWN_LAYOUT;
    const size = GRID_SIZE * PX_PER_M;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    const tx = (x) => (x + GRID_HALF) * PX_PER_M;
    const rect = (x0, z0, x1, z1, color) => {
        g.fillStyle = color;
        g.fillRect(tx(Math.min(x0, x1)), tx(Math.min(z0, z1)), Math.abs(x1 - x0) * PX_PER_M, Math.abs(z1 - z0) * PX_PER_M);
    };

    g.fillStyle = rural ? PALETTE.groundRural : PALETTE.ground;
    g.fillRect(0, 0, size, size);
    if (cfg.waterWest) rect(-GRID_HALF, -GRID_HALF, -34, GRID_HALF, PALETTE.water);

    if (rural) {
        rect(-GRID_HALF, L.northZ - 13, GRID_HALF, L.northZ - 7, PALETTE.water);
        [-36, -22, -8, 8, 22, 36].forEach((x) => rect(x - 6.2, L.southZ + 4, x + 6.2, L.southZ + 14, PALETTE.rice));
    }

    // Jalan lingkar
    const rw = rural ? 2.1 : L.roadW / 2 + 2.4;
    const roadColor = rural ? PALETTE.dirt : PALETTE.roadEdge;
    const westStart = cfg.waterWest ? -32 : -L.extent;
    [L.southZ, L.northZ].forEach((z) => rect(westStart, z - rw, L.extent, z + rw, roadColor));
    if (!cfg.waterWest) rect(L.westX - rw, -L.extent, L.westX + rw, L.extent, roadColor);
    rect(L.eastX - rw, -L.extent, L.eastX + rw, L.extent, roadColor);
    if (!rural) {
        const ri = L.roadW / 2;
        [L.southZ, L.northZ].forEach((z) => rect(westStart, z - ri, L.extent, z + ri, PALETTE.road));
        if (!cfg.waterWest) rect(L.westX - ri, -L.extent, L.westX + ri, L.extent, PALETTE.road);
        rect(L.eastX - ri, -L.extent, L.eastX + ri, L.extent, PALETTE.road);
    }

    // Area inti: plaza tengah, jalur ke distrik latihan & ujian, jalur ke selatan
    g.fillStyle = PALETTE.plaza;
    g.beginPath();
    g.arc(tx(0), tx(-4), 15 * PX_PER_M, 0, Math.PI * 2);
    g.fill();
    rect(-34, 8, 34, 12, PALETTE.plaza);
    rect(-2, -4, 2, L.southZ, PALETTE.plaza);
    rect(-41.5, 2.5, -26.5, 17.5, '#8a6a2a');
    rect(26.5, 2.5, 41.5, 17.5, '#2f7a55');

    // Jejak bangunan
    const fp = getFootprint();
    for (let i = 0; i < fp.length; i += 1) {
        const v = fp[i];
        if (!v) continue;
        g.fillStyle = v & FOOTPRINT_CORE ? PALETTE.core : PALETTE.town;
        g.fillRect((i % GRID_SIZE) * PX_PER_M, Math.floor(i / GRID_SIZE) * PX_PER_M, PX_PER_M, PX_PER_M);
    }
    return c;
}

/** Ikon penanda bundar dengan glyph. */
function drawMarker(g, x, y, m, scale = 1) {
    const r = (m.kind === 'npc' ? 4.5 : 9) * scale;
    g.save();
    g.translate(x, y);
    if (m.pulse) {
        const t = (performance.now() % 1400) / 1400;
        g.globalAlpha = 1 - t;
        g.strokeStyle = m.color;
        g.lineWidth = 2 * scale;
        g.beginPath();
        g.arc(0, 0, r + t * 12 * scale, 0, Math.PI * 2);
        g.stroke();
        g.globalAlpha = 1;
    }
    g.fillStyle = m.locked ? '#475569' : m.color;
    g.strokeStyle = '#ffffff';
    g.lineWidth = 2 * scale;
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    if (m.glyph && m.kind !== 'npc') {
        g.fillStyle = '#ffffff';
        g.font = `900 ${Math.round(11 * scale)}px system-ui, sans-serif`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(m.glyph, 0, 0.5 * scale);
    }
    g.restore();
}

function drawPlayer(g, x, y, angle, scale = 1) {
    g.save();
    g.translate(x, y);
    g.rotate(angle);
    g.fillStyle = '#ffffff';
    g.strokeStyle = '#0f172a';
    g.lineWidth = 2 * scale;
    g.beginPath();
    g.moveTo(0, -10 * scale);
    g.lineTo(7 * scale, 8 * scale);
    g.lineTo(0, 4 * scale);
    g.lineTo(-7 * scale, 8 * scale);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
}

function useBase(mapKey) {
    const ref = useRef({ canvas: null, version: -1, builtAt: 0 });
    return () => {
        const st = ref.current;
        const v = gridVersion();
        const now = performance.now();
        if (!st.canvas || (v !== st.version && now - st.builtAt > 400)) {
            st.canvas = buildBase(mapKey);
            st.version = v;
            st.builtAt = now;
        }
        return st.canvas;
    };
}

/** Minimap bundar yang berputar mengikuti kamera. */
export function MiniMap({ mapKey, markers, objective, onOpen, size = 170, rangeM = 48 }) {
    const canvasRef = useRef();
    const getBase = useBase(mapKey);
    const dataRef = useRef({ markers, objective });
    dataRef.current = { markers, objective };

    useEffect(() => {
        let raf;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const cv = canvasRef.current;
        cv.width = size * dpr;
        cv.height = size * dpr;
        const g = cv.getContext('2d');
        const R = size / 2;
        const scale = R / rangeM;

        const draw = () => {
            raf = requestAnimationFrame(draw);
            const base = getBase();
            const { markers: mk, objective: obj } = dataRef.current;
            const { x: px, z: pz, camYaw, heading } = playerState;
            const cos = Math.cos(camYaw);
            const sin = Math.sin(camYaw);
            const toScreen = (wx, wz) => {
                const dx = (wx - px) * scale;
                const dz = (wz - pz) * scale;
                return [R + dx * cos - dz * sin, R + dx * sin + dz * cos];
            };

            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            g.clearRect(0, 0, size, size);
            g.save();
            g.beginPath();
            g.arc(R, R, R - 2, 0, Math.PI * 2);
            g.clip();
            g.translate(R, R);
            g.rotate(camYaw);
            g.scale(scale / PX_PER_M, scale / PX_PER_M);
            g.translate(-(px + GRID_HALF) * PX_PER_M, -(pz + GRID_HALF) * PX_PER_M);
            g.imageSmoothingEnabled = false;
            g.drawImage(base, 0, 0);
            g.restore();

            g.save();
            g.beginPath();
            g.arc(R, R, R - 2, 0, Math.PI * 2);
            g.clip();
            // Garis rute ke tujuan
            if (obj) {
                const [ox, oy] = toScreen(obj.x, obj.z);
                g.strokeStyle = obj.color;
                g.lineWidth = 4;
                g.setLineDash([8, 6]);
                g.lineDashOffset = -(performance.now() / 40) % 14;
                g.beginPath();
                g.moveTo(R, R);
                g.lineTo(ox, oy);
                g.stroke();
                g.setLineDash([]);
            }
            // Penanda
            (mk || []).forEach((m) => {
                const [sx, sy] = toScreen(m.x, m.z);
                const d = Math.hypot(sx - R, sy - R);
                if (d > R - 10) {
                    if (m.kind === 'npc') return;
                    const k = (R - 12) / d; // tempel di tepi lingkaran
                    drawMarker(g, R + (sx - R) * k, R + (sy - R) * k, m, 0.8);
                } else {
                    drawMarker(g, sx, sy, m);
                }
            });
            drawPlayer(g, R, R, camYaw + Math.PI - heading);
            g.restore();

            // Bingkai & arah utara
            g.strokeStyle = 'rgba(255,255,255,0.85)';
            g.lineWidth = 3;
            g.beginPath();
            g.arc(R, R, R - 2, 0, Math.PI * 2);
            g.stroke();
            const nx = R + sin * (R - 11);
            const ny = R - cos * (R - 11);
            g.fillStyle = '#dc2626';
            g.beginPath();
            g.arc(nx, ny, 9, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#ffffff';
            g.font = '900 11px system-ui, sans-serif';
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText('U', nx, ny + 0.5);
        };
        draw();
        return () => cancelAnimationFrame(raf);
    }, [size, rangeM]);

    return (
        <button
            type="button"
            onClick={onOpen}
            className="relative block rounded-full shadow-2xl ring-4 ring-slate-950/60 cursor-pointer group"
            style={{ width: size, height: size }}
            aria-label="Buka peta penuh"
        >
            <canvas ref={canvasRef} style={{ width: size, height: size }} className="rounded-full block" />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-slate-600 text-[9px] font-extrabold text-white tracking-wider flex items-center gap-1 group-hover:border-cyan-400">
                <MapIcon className="w-3 h-3 text-cyan-300" /> PETA<span className="hidden md:inline"> [M]</span>
            </span>
        </button>
    );
}

/** Peta penuh utara-di-atas dengan legenda. */
export function FullMap({ mapKey, markers, objective, onClose, title }) {
    const canvasRef = useRef();
    const wrapRef = useRef();
    const getBase = useBase(mapKey);
    const dataRef = useRef({ markers, objective });
    dataRef.current = { markers, objective };

    useEffect(() => {
        let raf;
        const cv = canvasRef.current;
        const g = cv.getContext('2d');
        const view = 80; // setengah lebar area yang ditampilkan (m)
        const draw = () => {
            raf = requestAnimationFrame(draw);
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const S = Math.min(wrapRef.current?.clientWidth || 600, wrapRef.current?.clientHeight || 600);
            if (cv.width !== Math.round(S * dpr)) {
                cv.width = Math.round(S * dpr);
                cv.height = Math.round(S * dpr);
                cv.style.width = `${S}px`;
                cv.style.height = `${S}px`;
            }
            const scale = S / (view * 2);
            const toScreen = (wx, wz) => [(wx + view) * scale, (wz + view + 6) * scale];
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            g.clearRect(0, 0, S, S);
            g.save();
            g.scale(scale / PX_PER_M, scale / PX_PER_M);
            g.translate(-(GRID_HALF - view) * PX_PER_M, -(GRID_HALF - view - 6) * PX_PER_M);
            g.drawImage(getBase(), 0, 0);
            g.restore();

            const { markers: mk, objective: obj } = dataRef.current;
            const [ppx, ppy] = toScreen(playerState.x, playerState.z);
            if (obj) {
                const [ox, oy] = toScreen(obj.x, obj.z);
                g.strokeStyle = obj.color;
                g.lineWidth = 4;
                g.setLineDash([10, 7]);
                g.lineDashOffset = -(performance.now() / 40) % 17;
                g.beginPath();
                g.moveTo(ppx, ppy);
                g.lineTo(ox, oy);
                g.stroke();
                g.setLineDash([]);
            }
            const ms = Math.max(1, S / 520);
            (mk || []).forEach((m) => {
                const [sx, sy] = toScreen(m.x, m.z);
                drawMarker(g, sx, sy, m, ms * 1.15);
                if (m.kind !== 'npc' && m.short) {
                    g.font = `800 ${Math.round(11 * ms)}px system-ui, sans-serif`;
                    g.textAlign = 'center';
                    g.lineWidth = 4;
                    g.strokeStyle = 'rgba(2,6,23,0.85)';
                    g.strokeText(m.short, sx, sy + 20 * ms);
                    g.fillStyle = '#ffffff';
                    g.fillText(m.short, sx, sy + 20 * ms);
                }
            });
            drawPlayer(g, ppx, ppy, Math.PI - playerState.heading, ms * 1.2);
        };
        draw();
        return () => cancelAnimationFrame(raf);
    }, []);

    const legend = (markers || []).filter((m) => m.kind !== 'npc');

    return (
        <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
            <div
                className="w-full max-w-5xl h-full max-h-[92vh] flex flex-col md:flex-row gap-3 rounded-3xl bg-slate-900 border-2 border-slate-700 p-3 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div ref={wrapRef} className="relative flex-1 min-h-0 flex items-center justify-center rounded-2xl overflow-hidden bg-slate-950">
                    <canvas ref={canvasRef} className="block" />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-black">U ▲ Utara</div>
                </div>
                <div className="md:w-64 shrink-0 flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between">
                        <h3 className="font-game text-lg text-white tracking-wide">{title || 'Peta Kawasan'}</h3>
                        <button type="button" onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer" aria-label="Tutup peta">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
                        {legend.map((m) => (
                            <div key={m.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/70">
                                <span
                                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shrink-0"
                                    style={{ background: m.locked ? '#475569' : m.color }}
                                >
                                    {m.glyph}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-white truncate">{m.label}</p>
                                    <p className="text-[10px] text-slate-400">{m.status}</p>
                                </div>
                            </div>
                        ))}
                        <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] text-slate-300">
                            <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm" style={{ background: PALETTE.core }} /> Bangunan ikonik</span>
                            <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm" style={{ background: PALETTE.town }} /> Rumah & toko</span>
                            <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm" style={{ background: PALETTE.roadEdge }} /> Jalan</span>
                            <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-full bg-white" /> Posisi Anda</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500">Garis putus-putus = rute ke tujuan berikutnya. Tekan M atau ketuk di luar peta untuk menutup.</p>
                </div>
            </div>
        </div>
    );
}
