import React from 'react';
import { Box, Cyl, Cone, Sphere, SignBoard, Tree, PalmTree, Bush, Fence, StreetLamp } from './Primitives';

/*
 * Properti kota bergaya Roblox (Brookhaven / Livetopia) untuk lapisan "kota sekitar".
 * Semua komponen di file ini STATIS (tanpa useFrame) sehingga aman digabung oleh <StaticBatch>.
 * Arah depan setiap bangunan = sumbu +Z lokal; putar grup untuk menghadap jalan.
 */

const RAD = Math.PI / 180;

/* ---------- Helper bangunan ---------- */

/** Atap pelana (segitiga prisma). w = panjang bubungan (sumbu X), d = lebar (sumbu Z), h = tinggi. */
export function GableRoof({ p = [0, 0, 0], w = 8, d = 6, h = 2.4, c = '#7f1d1d' }) {
    return (
        <mesh position={[p[0], p[1] + h / 3, p[2]]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} scale={[d / 1.732, w, h / 1.5]} castShadow>
            <cylinderGeometry args={[1, 1, 1, 3]} />
            <meshStandardMaterial color={c} flatShading roughness={0.85} />
        </mesh>
    );
}

/** Jendela berbingkai dengan kaca & kusen silang, menempel pada dinding yang menghadap +Z. */
export function Win({ p, w = 1.2, h = 1.2, frame = '#ffffff', glass = '#93c5fd', shutter }) {
    return (
        <group position={p}>
            <Box p={[0, 0, 0]} s={[w + 0.22, h + 0.22, 0.08]} c={frame} />
            <Box p={[0, 0, 0.03]} s={[w, h, 0.08]} c={glass} emissive="#bfdbfe" ei={0.25} rough={0.15} metal={0.3} />
            <Box p={[0, 0, 0.08]} s={[0.07, h, 0.04]} c={frame} />
            <Box p={[0, 0, 0.08]} s={[w, 0.07, 0.04]} c={frame} />
            <Box p={[0, -h / 2 - 0.14, 0.08]} s={[w + 0.4, 0.1, 0.22]} c={frame} />
            {shutter && (
                <>
                    <Box p={[-w / 2 - 0.32, 0, 0.02]} s={[0.36, h + 0.1, 0.06]} c={shutter} />
                    <Box p={[w / 2 + 0.32, 0, 0.02]} s={[0.36, h + 0.1, 0.06]} c={shutter} />
                </>
            )}
        </group>
    );
}

/** Pintu dengan bingkai & gagang. */
export function Door({ p, c = '#7c2d12', w = 1.1, h = 2.2 }) {
    return (
        <group position={p}>
            <Box p={[0, h / 2, 0]} s={[w + 0.2, h + 0.15, 0.08]} c="#f8fafc" />
            <Box p={[0, h / 2, 0.04]} s={[w, h, 0.08]} c={c} />
            <Box p={[0, h * 0.72, 0.09]} s={[w * 0.6, h * 0.25, 0.03]} c="#bae6fd" />
            <Sphere p={[w * 0.35, h * 0.48, 0.12]} a={[0.06, 6, 4]} c="#facc15" metal={0.8} rough={0.3} />
        </group>
    );
}

/* ---------- Perabot jalan ---------- */

export function Hydrant({ p }) {
    return (
        <group position={p}>
            <Cyl p={[0, 0.35, 0]} a={[0.16, 0.18, 0.7, 8]} c="#dc2626" />
            <Sphere p={[0, 0.72, 0]} a={[0.17, 8, 6]} c="#dc2626" />
            <Cyl p={[0, 0.45, 0]} r={[0, 0, Math.PI / 2]} a={[0.07, 0.07, 0.5, 6]} c="#b91c1c" />
        </group>
    );
}

export function TrashBin({ p, c = '#15803d' }) {
    return (
        <group position={p}>
            <Cyl p={[0, 0.45, 0]} a={[0.3, 0.26, 0.9, 10]} c={c} />
            <Cyl p={[0, 0.93, 0]} a={[0.33, 0.33, 0.08, 10]} c="#14532d" />
        </group>
    );
}

export function Mailbox({ p, r = 0, c = '#1d4ed8' }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.5, 0]} s={[0.1, 1, 0.1]} c="#78350f" />
            <Box p={[0, 1.12, 0]} s={[0.36, 0.3, 0.55]} c={c} />
            <Box p={[0.2, 1.25, -0.1]} s={[0.03, 0.22, 0.1]} c="#dc2626" />
        </group>
    );
}

export function TrafficLight({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Cyl p={[0, 2.6, 0]} a={[0.1, 0.13, 5.2, 8]} c="#27272a" metal={0.5} />
            <Box p={[1.6, 5.0, 0]} s={[3.2, 0.14, 0.14]} c="#27272a" />
            <Box p={[3.0, 4.35, 0]} s={[0.5, 1.4, 0.45]} c="#18181b" />
            <Sphere p={[3.0, 4.8, 0.24]} a={[0.15, 8, 6]} c="#7f1d1d" />
            <Sphere p={[3.0, 4.35, 0.24]} a={[0.15, 8, 6]} c="#713f12" />
            <Sphere p={[3.0, 3.9, 0.24]} a={[0.15, 8, 6]} c="#22c55e" emissive="#22c55e" ei={1.5} />
        </group>
    );
}

export function StreetSign({ p, r = 0, text = 'JL. BAHASA' }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Cyl p={[0, 1.4, 0]} a={[0.05, 0.05, 2.8, 6]} c="#71717a" />
            <SignBoard p={[0, 2.85, 0]} text={text} size={[1.9, 0.4]} bg="#15803d" fg="#ffffff" font="bold 52px sans-serif" />
        </group>
    );
}

export function BusStop({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.12, 0]} s={[4.2, 0.24, 2]} c="#a1a1aa" />
            <Box p={[0, 2.7, 0]} s={[4.4, 0.15, 2.2]} c="#0ea5e9" />
            <Box p={[0, 1.4, -0.9]} s={[4, 2.4, 0.06]} c="#bae6fd" opacity={0.45} />
            {[-2, 2].map((x) => (
                <Box key={x} p={[x, 1.4, -0.9]} s={[0.12, 2.6, 0.12]} c="#334155" />
            ))}
            <Box p={[0, 0.55, -0.55]} s={[3, 0.12, 0.5]} c="#f59e0b" />
            <SignBoard p={[1.6, 3.2, 0.3]} text="HALTE" size={[1.3, 0.45]} bg="#0369a1" fg="#ffffff" font="bold 60px sans-serif" />
        </group>
    );
}

/** Tiang listrik khas Indonesia dengan trafo kecil. */
export function PowerPole({ p, h = 7, trafo = false }) {
    return (
        <group position={p}>
            <Cyl p={[0, h / 2, 0]} a={[0.11, 0.15, h, 6]} c="#71717a" />
            <Box p={[0, h - 0.4, 0]} s={[0.1, 0.1, 1.8]} c="#3f3f46" />
            {trafo && <Cyl p={[0.32, h - 1.6, 0]} a={[0.25, 0.25, 0.8, 8]} c="#9ca3af" metal={0.5} />}
        </group>
    );
}

/** Kabel listrik lurus antar tiang (sumbu Z). */
export function Wires({ x, y = 6.6, z1, z2 }) {
    const len = Math.abs(z2 - z1);
    const zc = (z1 + z2) / 2;
    return (
        <group>
            <Box p={[x, y, zc]} s={[0.03, 0.03, len]} c="#18181b" />
            <Box p={[x, y - 0.15, zc + 0.01]} s={[0.03, 0.03, len]} c="#18181b" />
        </group>
    );
}

export function FlowerBed({ p, w = 2.4, colors = ['#f472b6', '#facc15', '#f87171', '#a78bfa'] }) {
    const n = Math.max(3, Math.round(w / 0.45));
    return (
        <group position={p}>
            <Box p={[0, 0.15, 0]} s={[w, 0.3, 0.7]} c="#78350f" />
            {Array.from({ length: n }).map((_, i) => (
                <Sphere key={i} p={[-w / 2 + 0.25 + (i * (w - 0.5)) / (n - 1), 0.42, (i % 2) * 0.18 - 0.09]} a={[0.15, 6, 4]} c={colors[i % colors.length]} />
            ))}
        </group>
    );
}

export function PicnicTable({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.78, 0]} s={[2, 0.1, 0.9]} c="#a16207" />
            <Box p={[0, 0.45, 0.75]} s={[2, 0.08, 0.35]} c="#a16207" />
            <Box p={[0, 0.45, -0.75]} s={[2, 0.08, 0.35]} c="#a16207" />
            {[-0.8, 0.8].map((x) => (
                <Box key={x} p={[x, 0.4, 0]} s={[0.1, 0.8, 1.6]} c="#713f12" />
            ))}
        </group>
    );
}

/* ---------- Kendaraan statis (parkir) ---------- */

/** Mobil sedan/SUV gaya Roblox. Depan = +X lokal. */
export function CarBody({ c = '#ef4444', kind = 'sedan' }) {
    const L = kind === 'suv' ? 4.2 : kind === 'pickup' ? 4.6 : 4;
    const cabH = kind === 'suv' ? 0.95 : 0.72;
    const cabL = kind === 'pickup' ? 1.7 : kind === 'suv' ? 2.8 : 2.2;
    const cabX = kind === 'pickup' ? 0.6 : -0.2;
    return (
        <group>
            <Box p={[0, 0.68, 0]} s={[L, 0.62, 1.9]} c={c} rough={0.35} metal={0.3} />
            <Box p={[cabX, 0.99 + cabH / 2, 0]} s={[cabL, cabH, 1.72]} c={c} rough={0.35} metal={0.3} />
            <Box p={[cabX, 1.02 + cabH / 2, 0]} s={[cabL + 0.06, cabH * 0.62, 1.76]} c="#1e293b" rough={0.1} metal={0.6} />
            <Box p={[L / 2 + 0.02, 0.72, 0.6]} s={[0.06, 0.18, 0.4]} c="#fef9c3" emissive="#fde047" ei={0.8} />
            <Box p={[L / 2 + 0.02, 0.72, -0.6]} s={[0.06, 0.18, 0.4]} c="#fef9c3" emissive="#fde047" ei={0.8} />
            <Box p={[-L / 2 - 0.02, 0.75, 0]} s={[0.06, 0.16, 1.7]} c="#dc2626" emissive="#ef4444" ei={0.6} />
            <Box p={[L / 2 + 0.05, 0.42, 0]} s={[0.12, 0.2, 1.92]} c="#d4d4d8" />
            <Box p={[-L / 2 - 0.05, 0.42, 0]} s={[0.12, 0.2, 1.92]} c="#d4d4d8" />
            {[[L / 2 - 0.85, 0.95], [L / 2 - 0.85, -0.95], [-L / 2 + 0.85, 0.95], [-L / 2 + 0.85, -0.95]].map(([x, z], i) => (
                <Cyl key={i} p={[x, 0.38, z]} r={[Math.PI / 2, 0, 0]} a={[0.38, 0.38, 0.3, 12]} c="#111827" />
            ))}
        </group>
    );
}

export function ParkedCar({ p, r = 0, c, kind }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <CarBody c={c} kind={kind} />
        </group>
    );
}

/* ---------- Rumah warga gaya Brookhaven ---------- */

/**
 * Kavling rumah lengkap: halaman rumput, jalan masuk (carport), rumah 1/2 lantai,
 * teras bertiang, cerobong, kotak surat, pagar, taman bunga, pohon, dan mobil parkir.
 * Origin = pusat kavling; depan kavling (+Z) berbatasan dengan trotoar.
 */
export function HouseLot({ p, r = 0, wall = '#fde68a', roof = '#7f1d1d', trim = '#ffffff', door = '#7c2d12', shutter, floors = 1, car, carKind = 'sedan', lotW = 12, lotD = 14, seed = 0 }) {
    const hw = 7.4;
    const hd = 6;
    const H = floors === 2 ? 6.2 : 3.4;
    const hz = -1.6;
    const front = hz + hd / 2;
    return (
        <group position={p} rotation={[0, r, 0]}>
            {/* Halaman rumput & jalan masuk */}
            <Box p={[0, 0.04, 0]} s={[lotW - 0.2, 0.08, lotD - 0.2]} c="#4ade80" rough={1} />
            <Box p={[lotW / 2 - 2.0, 0.1, lotD / 2 - 3]} s={[3, 0.06, 6]} c="#a1a1aa" />
            <Box p={[-1.8, 0.1, (front + lotD / 2) / 2 + 0.5]} s={[1.1, 0.06, lotD / 2 - front - 1]} c="#d6d3d1" />

            {/* Rumah */}
            <group position={[-0.9, 0, hz]}>
                <Box p={[0, 0.15, 0]} s={[hw + 0.4, 0.3, hd + 0.4]} c="#9ca3af" />
                <Box p={[0, 0.3 + H / 2, 0]} s={[hw, H, hd]} c={wall} cast />
                <Box p={[0, 0.3 + H + 0.08, 0]} s={[hw + 0.2, 0.16, hd + 0.2]} c={trim} />
                {floors === 2 && <Box p={[0, 3.45, 0]} s={[hw + 0.1, 0.18, hd + 0.1]} c={trim} />}
                <GableRoof p={[0, 0.3 + H + 0.16, 0]} w={hw + 0.9} d={hd + 1.1} h={2.3} c={roof} />
                <Box p={[hw / 2 - 1.4, 0.3 + H + 1.5, -1]} s={[0.7, 2.2, 0.7]} c="#78716c" />

                {/* Fasad depan */}
                <Door p={[-0.9, 0.3, hd / 2]} c={door} />
                <Win p={[-2.75, 1.85, hd / 2]} w={1.3} h={1.1} frame={trim} shutter={shutter} />
                <Win p={[1.7, 1.85, hd / 2]} w={1.9} h={1.1} frame={trim} shutter={shutter} />
                {floors === 2 && (
                    <>
                        <Win p={[-2.2, 4.8, hd / 2]} w={1.3} h={1.0} frame={trim} shutter={shutter} />
                        <Win p={[1.7, 4.8, hd / 2]} w={1.3} h={1.0} frame={trim} shutter={shutter} />
                    </>
                )}
                {/* Jendela samping */}
                <group position={[hw / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <Win p={[0, 1.85, 0]} w={1.2} h={1.0} frame={trim} />
                </group>
                <group position={[-hw / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                    <Win p={[0, 1.85, 0]} w={1.2} h={1.0} frame={trim} />
                </group>

                {/* Teras */}
                <Box p={[-0.9, 0.2, hd / 2 + 1.0]} s={[3.4, 0.4, 2]} c="#d6d3d1" />
                <Box p={[-0.9, 2.75, hd / 2 + 1.0]} s={[3.8, 0.18, 2.3]} c={trim} />
                <Cyl p={[-2.5, 1.5, hd / 2 + 1.9]} a={[0.1, 0.1, 2.4, 8]} c={trim} />
                <Cyl p={[0.7, 1.5, hd / 2 + 1.9]} a={[0.1, 0.1, 2.4, 8]} c={trim} />
                <FlowerBed p={[2.0, 0.3, hd / 2 + 0.5]} w={2.4} />
            </group>

            {/* Pagar samping & belakang, kotak surat, pohon */}
            <Fence p={[0, 0, -lotD / 2 + 0.2]} length={lotW - 0.4} c={trim} />
            <Fence p={[-lotW / 2 + 0.2, 0, -1]} length={lotD - 2.4} r={Math.PI / 2} c={trim} />
            <Mailbox p={[-3.2, 0, lotD / 2 - 0.6]} c={seed % 2 ? '#1d4ed8' : '#dc2626'} />
            <Tree p={[-lotW / 2 + 1.6, 0, lotD / 2 - 2.2]} scale={0.95} leaf={seed % 2 ? '#16a34a' : '#22c55e'} />
            <Bush p={[-4.3, 0, front + 0.7]} scale={0.7} />
            <Bush p={[-4.3, 0, hz - 1.5]} scale={0.8} />
            {car && <ParkedCar p={[lotW / 2 - 2.0, 0, lotD / 2 - 4]} r={Math.PI / 2} c={car} kind={carKind} />}
        </group>
    );
}

/* ---------- Bangunan komersial & fasilitas umum ---------- */

/** Toko/ruko satu-dua lantai dengan etalase kaca, kanopi bergaris, dan papan nama. */
export function Shop({ p, r = 0, w = 10, d = 9, h = 4.4, c = '#f8fafc', accent = '#ef4444', awning2 = '#ffffff', sign = 'TOKO', signBg, floors = 1 }) {
    const H = floors === 2 ? h + 3.4 : h;
    const stripes = Math.round(w / 0.9);
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.05, 0]} s={[w + 2, 0.1, d + 2]} c="#d4d4d8" />
            <Box p={[0, H / 2, 0]} s={[w, H, d]} c={c} cast />
            <Box p={[0, H + 0.25, 0]} s={[w + 0.3, 0.5, d + 0.3]} c={accent} />
            {/* Etalase kaca */}
            <Box p={[0, 1.6, d / 2 + 0.02]} s={[w - 1.2, 2.6, 0.1]} c="#7dd3fc" emissive="#e0f2fe" ei={0.3} rough={0.1} metal={0.4} />
            {[-w / 2 + 0.6, -w / 6, w / 6, w / 2 - 0.6].map((x, i) => (
                <Box key={i} p={[x, 1.6, d / 2 + 0.06]} s={[0.14, 2.7, 0.08]} c="#3f3f46" />
            ))}
            <Box p={[0, 1.2, d / 2 + 0.08]} s={[1.6, 2.4, 0.06]} c="#e0f2fe" opacity={0.6} />
            {/* Kanopi bergaris */}
            {Array.from({ length: stripes }).map((_, i) => (
                <Box key={i} p={[-w / 2 + (w / stripes) * (i + 0.5), 3.2, d / 2 + 0.7]} r={[0.4, 0, 0]} s={[w / stripes, 0.08, 1.5]} c={i % 2 ? awning2 : accent} />
            ))}
            <SignBoard p={[0, H - 0.6, d / 2 + 0.1]} text={sign} size={[Math.min(w - 1, 7.5), 0.95]} bg={signBg || accent} fg="#ffffff" font="bold 64px sans-serif" />
            {floors === 2 && (
                <>
                    <Win p={[-w / 4, 5.6, d / 2]} w={1.6} h={1.2} />
                    <Win p={[w / 4, 5.6, d / 2]} w={1.6} h={1.2} />
                </>
            )}
            {/* Unit AC di atap */}
            <Box p={[-w / 4, H + 0.9, -1]} s={[1.4, 0.9, 1.1]} c="#e4e4e7" />
            <Box p={[w / 4, H + 0.9, -1.5]} s={[1.4, 0.9, 1.1]} c="#e4e4e7" />
        </group>
    );
}

/** Apartemen bertingkat dengan balkon. */
export function Apartment({ p, r = 0, floors = 5, w = 12, d = 9, c = '#e0e7ff', accent = '#4f46e5' }) {
    const fh = 3.2;
    const H = floors * fh;
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, H / 2, 0]} s={[w, H, d]} c={c} cast />
            <Box p={[0, H + 0.3, 0]} s={[w + 0.4, 0.6, d + 0.4]} c={accent} />
            <Box p={[0, 1.3, d / 2 + 0.02]} s={[3, 2.4, 0.1]} c="#7dd3fc" rough={0.1} />
            <Box p={[0, 2.8, d / 2 + 0.9]} s={[4, 0.2, 1.8]} c={accent} />
            {Array.from({ length: floors - 1 }).map((_, f) => (
                <group key={f} position={[0, fh * (f + 1) + 1.4, d / 2]}>
                    {[-w / 3, 0, w / 3].map((x, i) => (
                        <group key={i} position={[x, 0, 0]}>
                            <Win p={[0, 0.2, 0]} w={1.6} h={1.5} frame="#f8fafc" />
                            <Box p={[0, -0.9, 0.6]} s={[2.4, 0.15, 1.2]} c="#d4d4d8" />
                            <Box p={[0, -0.55, 1.15]} s={[2.4, 0.6, 0.06]} c={accent} opacity={0.75} />
                        </group>
                    ))}
                </group>
            ))}
            <Box p={[w / 3, H + 1.6, -1]} s={[0.15, 2, 0.15]} c="#a1a1aa" />
            <Cyl p={[-w / 4, H + 1.4, -1.5]} a={[1, 1, 1.6, 10]} c="#cbd5e1" />
        </group>
    );
}

/** SPBU (stasiun pengisian bahan bakar) generik — tanpa merek nyata. */
export function GasStation({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.05, 0]} s={[16, 0.1, 14]} c="#a1a1aa" />
            <Box p={[0, 5.0, 2]} s={[11, 0.7, 7]} c="#f8fafc" cast />
            <Box p={[0, 5.0, 2]} s={[11.1, 0.3, 7.1]} c="#dc2626" />
            {[[-4.5, -0.6], [4.5, -0.6], [-4.5, 4.6], [4.5, 4.6]].map(([x, z], i) => (
                <Box key={i} p={[x, 2.4, z]} s={[0.4, 4.8, 0.4]} c="#e4e4e7" />
            ))}
            {[-2.2, 2.2].map((x) => (
                <group key={x} position={[x, 0, 2]}>
                    <Box p={[0, 0.2, 0]} s={[1.2, 0.4, 3]} c="#d4d4d8" />
                    <Box p={[0, 1.2, 0]} s={[0.8, 1.8, 0.7]} c="#dc2626" />
                    <Box p={[0, 1.6, 0.36]} s={[0.55, 0.45, 0.04]} c="#bbf7d0" emissive="#22c55e" ei={0.6} />
                </group>
            ))}
            <Box p={[0, 1.8, -5]} s={[9, 3.6, 3.6]} c="#f8fafc" cast />
            <Box p={[0, 1.4, -3.18]} s={[6, 2, 0.08]} c="#7dd3fc" rough={0.1} />
            <SignBoard p={[0, 3.2, -3.1]} text="MINIMARKET 24 JAM" size={[5, 0.6]} bg="#1d4ed8" fg="#ffffff" font="bold 52px sans-serif" />
            <group position={[6.6, 0, 6]}>
                <Box p={[0, 2.6, 0]} s={[0.3, 5.2, 0.3]} c="#3f3f46" />
                <SignBoard p={[0, 5.4, 0]} text={'SPBU\nBuka 24 Jam'} size={[2.4, 1.5]} bg="#dc2626" fg="#ffffff" font="bold 46px sans-serif" />
            </group>
        </group>
    );
}

/** Puskesmas dengan ambulans. */
export function Clinic({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.05, 0]} s={[16, 0.1, 13]} c="#d4d4d8" />
            <Box p={[0, 3.6, -1.5]} s={[13, 7.2, 8]} c="#f8fafc" cast />
            <Box p={[0, 7.45, -1.5]} s={[13.3, 0.5, 8.3]} c="#16a34a" />
            <Box p={[0, 3.3, 3.2]} s={[5, 0.25, 2.6]} c="#16a34a" />
            <Cyl p={[-2.2, 1.6, 4.3]} a={[0.12, 0.12, 3.2, 8]} c="#f8fafc" />
            <Cyl p={[2.2, 1.6, 4.3]} a={[0.12, 0.12, 3.2, 8]} c="#f8fafc" />
            <Box p={[0, 1.3, 2.54]} s={[2.4, 2.6, 0.08]} c="#bae6fd" rough={0.1} />
            {[-4.6, 4.6].map((x) => (
                <group key={x}>
                    <Win p={[x, 1.9, 2.5]} w={2} h={1.2} />
                    <Win p={[x, 5.3, 2.5]} w={2} h={1.2} />
                </group>
            ))}
            <Win p={[0, 5.3, 2.5]} w={2} h={1.2} />
            <Box p={[0, 6.6, 2.6]} s={[1.1, 0.35, 0.1]} c="#dc2626" emissive="#ef4444" ei={0.5} />
            <Box p={[0, 6.6, 2.6]} s={[0.35, 1.1, 0.1]} c="#dc2626" emissive="#ef4444" ei={0.5} />
            <SignBoard p={[0, 3.85, 4.5]} text="PUSKESMAS" size={[4.4, 0.7]} bg="#15803d" fg="#ffffff" font="bold 64px sans-serif" />
            <group position={[5.4, 0, 5.2]}>
                <CarBody c="#f8fafc" kind="suv" />
                <Box p={[0, 1.95, 0]} s={[0.6, 0.15, 0.4]} c="#ef4444" emissive="#ef4444" ei={1} />
                <Box p={[0.2, 0.75, 0.97]} s={[1.6, 0.12, 0.02]} c="#dc2626" />
            </group>
        </group>
    );
}

/** Pos pemadam kebakaran dengan mobil damkar. */
export function FireStation({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.05, 0]} s={[15, 0.1, 13]} c="#d4d4d8" />
            <Box p={[0, 3.5, -1.5]} s={[12, 7, 8]} c="#b91c1c" cast />
            <Box p={[0, 7.25, -1.5]} s={[12.3, 0.5, 8.3]} c="#f8fafc" />
            {[-3, 3].map((x) => (
                <group key={x}>
                    <Box p={[x, 2.2, 2.52]} s={[4.2, 4.4, 0.08]} c="#e4e4e7" />
                    {[0.6, 1.4, 2.2, 3.0, 3.8].map((y) => (
                        <Box key={y} p={[x, y, 2.58]} s={[4.2, 0.06, 0.04]} c="#a1a1aa" />
                    ))}
                </group>
            ))}
            <SignBoard p={[0, 5.6, 2.6]} text="POS DAMKAR" size={[5.6, 0.8]} bg="#7f1d1d" fg="#fde68a" font="bold 64px sans-serif" />
            <group position={[-2, 0, 4.6]}>
                <Box p={[0, 1.3, 0]} s={[6.4, 1.8, 2.2]} c="#dc2626" />
                <Box p={[2.4, 2.5, 0]} s={[1.6, 0.8, 2.1]} c="#1e293b" />
                <Box p={[-0.6, 2.4, 0]} s={[4.4, 0.15, 0.5]} c="#d4d4d8" />
                {[-2.2, 0, 2.2].map((x) => [1, -1].map((z) => <Cyl key={`${x}${z}`} p={[x, 0.45, z * 1.1]} r={[Math.PI / 2, 0, 0]} a={[0.45, 0.45, 0.3, 12]} c="#111827" />))}
            </group>
        </group>
    );
}

/** Kantor polisi sektor. */
export function PoliceStation({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.05, 0]} s={[15, 0.1, 13]} c="#d4d4d8" />
            <Box p={[0, 3.4, -1.5]} s={[12, 6.8, 8]} c="#e2e8f0" cast />
            <Box p={[0, 7.0, -1.5]} s={[12.3, 0.5, 8.3]} c="#1e3a8a" />
            <Box p={[0, 1.4, 2.54]} s={[2.6, 2.8, 0.08]} c="#1e3a8a" />
            {[-4, 4].map((x) => (
                <group key={x}>
                    <Win p={[x, 1.9, 2.5]} w={2} h={1.2} frame="#1e3a8a" />
                    <Win p={[x, 5.1, 2.5]} w={2} h={1.2} frame="#1e3a8a" />
                </group>
            ))}
            <SignBoard p={[0, 5.1, 2.6]} text="POS POLISI" size={[4.4, 0.8]} bg="#1e3a8a" fg="#ffffff" font="bold 64px sans-serif" />
            <group position={[3.6, 0, 4.6]}>
                <CarBody c="#f8fafc" kind="sedan" />
                <Box p={[-0.2, 1.8, 0]} s={[0.8, 0.15, 1.2]} c="#2563eb" emissive="#3b82f6" ei={1} />
            </group>
        </group>
    );
}

/** Taman bermain: perosotan, ayunan, jungkat-jungkit, bak pasir. */
export function Playground({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.06, 0]} s={[12, 0.12, 9]} c="#fdba74" rough={1} />
            {/* Menara & perosotan */}
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
                <Box key={i} p={[-3 + x, 1.4, -1 + z]} s={[0.2, 2.8, 0.2]} c="#2563eb" />
            ))}
            <Box p={[-3, 1.8, -1]} s={[2.3, 0.2, 2.3]} c="#facc15" />
            <mesh position={[-3, 3.35, -1]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[1.8, 1.4, 4]} />
                <meshStandardMaterial color="#ef4444" flatShading />
            </mesh>
            <Box p={[-3, 1.0, 1.6]} r={[0.62, 0, 0]} s={[0.9, 0.1, 3.4]} c="#22c55e" />
            <Box p={[-4.2, 0.9, -1]} r={[0, 0, 0.9]} s={[0.1, 2.5, 0.8]} c="#a855f7" />
            {/* Ayunan */}
            <Box p={[2.5, 2.6, -2]} s={[4, 0.18, 0.18]} c="#dc2626" />
            {[0.6, 4.4].map((x) => (
                <Box key={x} p={[x, 1.3, -2]} r={[0, 0, x < 2 ? 0.15 : -0.15]} s={[0.15, 2.8, 0.15]} c="#dc2626" />
            ))}
            {[1.7, 3.3].map((x) => (
                <group key={x}>
                    <Box p={[x - 0.3, 1.6, -2]} s={[0.03, 2, 0.03]} c="#71717a" />
                    <Box p={[x + 0.3, 1.6, -2]} s={[0.03, 2, 0.03]} c="#71717a" />
                    <Box p={[x, 0.6, -2]} s={[0.8, 0.08, 0.4]} c="#facc15" />
                </group>
            ))}
            {/* Jungkat-jungkit */}
            <Box p={[2.5, 0.25, 2]} s={[0.3, 0.5, 0.3]} c="#3f3f46" />
            <Box p={[2.5, 0.55, 2]} r={[0, 0, 0.2]} s={[3.6, 0.1, 0.4]} c="#0ea5e9" />
            {/* Bak pasir */}
            <Box p={[-3, 0.15, 3.3]} s={[3, 0.3, 1.6]} c="#a16207" />
            <Box p={[-3, 0.2, 3.3]} s={[2.7, 0.3, 1.3]} c="#fde68a" />
        </group>
    );
}

/** Lapangan basket mini dengan dua ring. */
export function BasketCourt({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.06, 0]} s={[10, 0.12, 15]} c="#2563eb" />
            <Box p={[0, 0.08, 0]} s={[8.6, 0.12, 13.6]} c="#f97316" />
            <Box p={[0, 0.1, 0]} s={[8.6, 0.12, 0.12]} c="#ffffff" />
            {[-6.2, 6.2].map((z) => (
                <group key={z} position={[0, 0, z]} rotation={[0, z > 0 ? Math.PI : 0, 0]}>
                    <Cyl p={[0, 1.6, 0]} a={[0.1, 0.1, 3.2, 8]} c="#3f3f46" />
                    <Box p={[0, 3.3, 0.3]} s={[1.6, 1, 0.08]} c="#ffffff" />
                    <mesh position={[0, 3.0, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.28, 0.03, 6, 14]} />
                        <meshStandardMaterial color="#ea580c" />
                    </mesh>
                </group>
            ))}
            <Fence p={[-5.3, 0, 0]} length={15} r={Math.PI / 2} c="#3f3f46" post="#27272a" />
            <Fence p={[5.3, 0, 0]} length={15} r={Math.PI / 2} c="#3f3f46" post="#27272a" />
        </group>
    );
}

/** Taman kota kecil berkolam dengan gazebo. */
export function PocketPark({ p, r = 0, w = 22, d = 16 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.04, 0]} s={[w, 0.08, d]} c="#4ade80" rough={1} />
            <Box p={[0, 0.09, d / 2 - 0.9]} s={[w, 0.06, 1.2]} c="#e7e5e4" />
            <Playground p={[-w / 2 + 6.3, 0, -d / 2 + 4.8]} r={0} />
            <group position={[w / 4 + 0.6, 0, 2.6]}>
                <Cyl p={[0, 0.1, 0]} a={[2.4, 2.4, 0.2, 8]} c="#d6d3d1" />
                {Array.from({ length: 6 }).map((_, i) => (
                    <Cyl key={i} p={[Math.cos(i * 60 * RAD) * 2, 1.4, Math.sin(i * 60 * RAD) * 2]} a={[0.1, 0.1, 2.6, 6]} c="#78350f" />
                ))}
                <Cone p={[0, 3.3, 0]} a={[3, 1.6, 6]} c="#b45309" />
            </group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[w / 4 + 0.6, 0.1, -d / 4]}>
                <circleGeometry args={[2.4, 20]} />
                <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.2} />
            </mesh>
            <PicnicTable p={[-w / 4 - 0.5, 0, d / 4 + 0.6]} />
            {[[-w / 2 + 1.2, -d / 2 + 1.2], [w / 2 - 1.2, -d / 2 + 1.2], [-w / 2 + 1.2, d / 2 - 2.4], [w / 2 - 1.2, d / 2 - 2.4]].map(([x, z], i) => (
                <Tree key={i} p={[x, 0, z]} scale={1.1} leaf={i % 2 ? '#15803d' : '#22c55e'} />
            ))}
            <StreetLamp p={[1.4, 0, 1.4]} r={Math.PI / 4} />
        </group>
    );
}

/* ---------- Varian pedesaan (Lebak / kampung) ---------- */

/** Petak sawah: air dangkal + baris padi + pematang. */
export function RiceField({ p, w = 12, d = 10, ripe = false }) {
    const rows = Math.floor(d / 0.9);
    const leaf = ripe ? '#ca8a04' : '#65a30d';
    return (
        <group position={p}>
            <Box p={[0, 0.05, 0]} s={[w, 0.1, d]} c="#7dd3a8" rough={0.2} metal={0.1} />
            {Array.from({ length: rows }).map((_, i) => (
                <Box key={i} p={[0, 0.25, -d / 2 + 0.6 + i * 0.9]} s={[w - 0.8, 0.35, 0.28]} c={leaf} />
            ))}
            <Box p={[0, 0.15, d / 2]} s={[w + 0.4, 0.3, 0.4]} c="#854d0e" />
            <Box p={[0, 0.15, -d / 2]} s={[w + 0.4, 0.3, 0.4]} c="#854d0e" />
            <Box p={[w / 2, 0.15, 0]} s={[0.4, 0.3, d]} c="#854d0e" />
            <Box p={[-w / 2, 0.15, 0]} s={[0.4, 0.3, d]} c="#854d0e" />
        </group>
    );
}

/** Saung (gubuk istirahat di sawah) beratap ijuk. */
export function Saung({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
                <Cyl key={i} p={[x, 1.1, z]} a={[0.09, 0.1, 2.2, 6]} c="#a16207" />
            ))}
            <Box p={[0, 0.7, 0]} s={[2.4, 0.12, 2.4]} c="#d6b37a" />
            <GableRoof p={[0, 2.2, 0]} w={3} d={3} h={1.4} c="#44403c" />
        </group>
    );
}

/** Rumpun bambu. */
export function BambooClump({ p, scale = 1 }) {
    const stems = [[0, 0], [0.4, 0.2], [-0.35, 0.3], [0.2, -0.4], [-0.3, -0.3], [0.5, -0.1]];
    return (
        <group position={p} scale={scale}>
            {stems.map(([x, z], i) => (
                <Cyl key={i} p={[x, 3 + (i % 3) * 0.4, z]} r={[x * 0.12, 0, z * 0.12]} a={[0.07, 0.09, 6 + (i % 3) * 0.8, 5]} c={i % 2 ? '#65a30d' : '#84cc16'} />
            ))}
            <mesh position={[0, 6.2, 0]} scale={[1.4, 1, 1.4]}>
                <icosahedronGeometry args={[1.2, 0]} />
                <meshStandardMaterial color="#4d7c0f" flatShading />
            </mesh>
        </group>
    );
}

export function BananaTree({ p, scale = 1 }) {
    return (
        <group position={p} scale={scale}>
            <Cyl p={[0, 1.3, 0]} a={[0.16, 0.22, 2.6, 6]} c="#a3a35a" />
            {[0, 1, 2, 3, 4].map((i) => (
                <mesh key={i} position={[0, 2.7, 0]} rotation={[0.7, (i * 2 * Math.PI) / 5, 0]}>
                    <boxGeometry args={[0.55, 0.04, 2.2]} />
                    <meshStandardMaterial color="#4ade80" flatShading />
                </mesh>
            ))}
        </group>
    );
}

/** Rumah panggung kampung (bambu & kayu, atap ijuk) — penggambaran sederhana dan santun. */
export function KampungHouse({ p, r = 0, wall = '#d6b37a', roof = '#44403c' }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            {[[-2.6, -2], [0, -2], [2.6, -2], [-2.6, 2], [0, 2], [2.6, 2]].map(([x, z], i) => (
                <Box key={i} p={[x, 0.45, z]} s={[0.3, 0.9, 0.3]} c="#78716c" />
            ))}
            <Box p={[0, 1.0, 0]} s={[6.4, 0.2, 4.8]} c="#92400e" />
            <Box p={[0, 2.3, -0.3]} s={[6, 2.4, 3.8]} c={wall} cast />
            {[-2, -1, 0, 1, 2].map((x) => (
                <Box key={x} p={[x * 1.2, 2.3, 1.62]} s={[0.05, 2.4, 0.04]} c="#a16207" />
            ))}
            <Box p={[-1.2, 2.0, 1.63]} s={[0.9, 1.8, 0.06]} c="#78350f" />
            <Box p={[1.4, 2.5, 1.63]} s={[1.0, 0.7, 0.06]} c="#422006" />
            <Box p={[0, 1.15, 2.0]} s={[6.4, 0.1, 0.8]} c="#a16207" />
            <Box p={[-1.2, 0.55, 2.7]} r={[-0.5, 0, 0]} s={[0.9, 0.08, 1.4]} c="#a16207" />
            <GableRoof p={[0, 3.5, -0.3]} w={7.2} d={5.6} h={2.2} c={roof} />
        </group>
    );
}

export { Tree, PalmTree, Bush, Fence, StreetLamp };
