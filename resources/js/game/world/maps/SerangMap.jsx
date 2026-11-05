import React from 'react';
import { Box, Cyl, Cone, Sphere, SignBoard, StreetLamp, Road, Plaza, Tree, PalmTree, Bench, Mountain, Cloud, Bush } from '../Primitives';

/*
 * BAB 2 — Kota Serang: Kawasan Banten Lama & Royal Baroe.
 * Masjid Agung Banten beratap tumpang lima, Menara Banten (putih, bersegi delapan),
 * reruntuhan tembok bata Keraton Surosowan, serta deretan ruko & lapak kuliner Royal.
 */

function MasjidAgung({ p }) {
    const tiers = [
        [12, 2.2, '#7c2d12'],
        [9.4, 2.0, '#9a3412'],
        [7, 1.8, '#7c2d12'],
        [4.8, 1.6, '#9a3412'],
        [2.8, 1.4, '#7c2d12'],
    ];
    let y = 4.6;
    return (
        <group position={p}>
            <Box p={[0, 0.3, 0]} s={[16, 0.6, 16]} c="#e7e5e4" receive />
            <Box p={[0, 2.4, 0]} s={[12, 3.8, 12]} c="#fffbeb" cast />
            {/* Serambi & tiang */}
            <Box p={[0, 1.8, 7.2]} s={[12, 0.3, 2.6]} c="#a8a29e" />
            {[-5, -2.5, 0, 2.5, 5].map((x) => (
                <Cyl key={x} p={[x, 1.0, 8.2]} a={[0.18, 0.18, 1.6, 8]} c="#f5f5f4" />
            ))}
            <Box p={[0, 1.6, 6.05]} s={[2, 2.6, 0.1]} c="#78350f" />
            {tiers.map(([w, h, c], i) => {
                const yy = y + h / 2;
                y += h * 0.82;
                return (
                    <group key={i}>
                        <mesh position={[0, yy, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                            <coneGeometry args={[w * 0.72, h, 4, 1, true]} />
                            <meshStandardMaterial color={c} flatShading side={2} />
                        </mesh>
                        {i < tiers.length - 1 && <Box p={[0, yy + h / 2 - 0.1, 0]} s={[w * 0.42, 0.5, w * 0.42]} c="#fef3c7" />}
                    </group>
                );
            })}
            <Sphere p={[0, y + 0.6, 0]} a={[0.3, 10, 8]} c="#facc15" metal={0.7} rough={0.3} />
        </group>
    );
}

function MenaraBanten({ p }) {
    return (
        <group position={p}>
            <Cyl p={[0, 1.2, 0]} a={[3.2, 3.6, 2.4, 8]} c="#f5f5f4" cast flat />
            <Box p={[0, 1.0, 3.3]} s={[1.2, 2, 0.4]} c="#78350f" />
            <Cyl p={[0, 9, 0]} a={[1.5, 2.6, 13, 8]} c="#fafaf9" cast flat />
            {[5, 9, 13].map((yy) => (
                <Cyl key={yy} p={[0, yy, 0]} a={[2.4 - (yy - 5) * 0.12, 2.4 - (yy - 5) * 0.12, 0.25, 8]} c="#e7e5e4" flat />
            ))}
            {/* Balkon & kepala menara */}
            <Cyl p={[0, 15.7, 0]} a={[2.2, 1.7, 0.6, 8]} c="#e7e5e4" flat />
            <Cyl p={[0, 17, 0]} a={[1.0, 1.1, 2.2, 8]} c="#fafaf9" flat />
            <Cone p={[0, 18.9, 0]} a={[1.3, 1.6, 8]} c="#57534e" />
            <Sphere p={[0, 19.9, 0]} a={[0.18, 8, 6]} c="#facc15" metal={0.7} />
        </group>
    );
}

function BrickWall({ p, length = 14, r = 0, h = 2.6 }) {
    const n = Math.floor(length / 2.2);
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, h / 2, 0]} s={[length, h, 1.2]} c="#b45309" cast rough={1} />
            {Array.from({ length: n }).map((_, i) => (
                <Box key={i} p={[-length / 2 + 1.1 + i * 2.2, h + 0.3, 0]} s={[1.1, 0.6, 1.2]} c="#9a3412" />
            ))}
        </group>
    );
}

function ShopHouse({ p, c = '#f59e0b', awning = '#dc2626', sign, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 2.5, 0]} s={[5, 5, 5]} c={c} cast />
            <Box p={[0, 5.2, 0]} s={[5.4, 0.4, 5.4]} c="#7c2d12" />
            <Box p={[0, 1.3, 2.52]} s={[3.6, 2.4, 0.06]} c="#0f172a" opacity={0.75} />
            <Box p={[0, 3.6, 2.52]} s={[1.2, 1, 0.06]} c="#bae6fd" emissive="#7dd3fc" ei={0.35} />
            <Box p={[-1.6, 3.6, 2.52]} s={[1, 1, 0.06]} c="#bae6fd" emissive="#7dd3fc" ei={0.35} />
            <Box p={[1.6, 3.6, 2.52]} s={[1, 1, 0.06]} c="#bae6fd" emissive="#7dd3fc" ei={0.35} />
            <Box p={[0, 2.75, 3.1]} r={[0.35, 0, 0]} s={[5, 0.12, 1.4]} c={awning} />
            {sign && <SignBoard p={[0, 4.6, 2.62]} text={sign} size={[4, 0.7]} bg="#7c2d12" fg="#fde68a" font="bold 60px sans-serif" />}
        </group>
    );
}

function FoodCart({ p, r = 0, c = '#16a34a' }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.9, 0]} s={[2, 1, 1]} c={c} cast />
            <Box p={[0, 2.2, 0]} s={[2.3, 0.1, 1.4]} c="#fde68a" />
            {[[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]].map(([x, z], i) => (
                <Box key={i} p={[x, 1.8, z]} s={[0.06, 0.8, 0.06]} c="#78350f" />
            ))}
            <Cyl p={[-0.7, 0.25, 0.5]} r={[Math.PI / 2, 0, 0]} a={[0.25, 0.25, 0.1, 10]} c="#1f2937" />
            <Cyl p={[0.7, 0.25, 0.5]} r={[Math.PI / 2, 0, 0]} a={[0.25, 0.25, 0.1, 10]} c="#1f2937" />
        </group>
    );
}

function StringLights({ from, to, count = 10 }) {
    const colors = ['#fde047', '#f472b6', '#38bdf8', '#4ade80', '#fb923c'];
    return (
        <group>
            {Array.from({ length: count }).map((_, i) => {
                const t = i / (count - 1);
                const sag = Math.sin(t * Math.PI) * 0.8;
                return (
                    <Sphere
                        key={i}
                        p={[from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t - sag, from[2] + (to[2] - from[2]) * t]}
                        a={[0.12, 6, 4]}
                        c={colors[i % colors.length]}
                        emissive={colors[i % colors.length]}
                        ei={1.2}
                    />
                );
            })}
        </group>
    );
}

export default function SerangMap({ variant = 'banten_lama' }) {
    const royal = variant === 'royal_baroe';
    return (
        <group>
            {/* Plaza tengah berubin */}
            <Plaza p={[0, 0.015, -1]} size={[26, 22]} c={royal ? '#e7e5e4' : '#d6d3d1'} />
            <Plaza p={[0, 0.02, -1]} size={[8]} c="#fef3c7" circle />

            {/* Banten Lama di belakang */}
            <MasjidAgung p={[-11, 0, -24]} />
            <MenaraBanten p={[6, 0, -21]} />
            <SignBoard p={[0, 1.4, -13.5]} text="KAWASAN BANTEN LAMA" size={[6, 0.9]} bg="#14532d" fg="#fef3c7" font="bold 52px sans-serif" />
            <Box p={[0, 0.5, -13.5]} s={[6.4, 1, 0.4]} c="#a8a29e" />

            {/* Reruntuhan Keraton Surosowan */}
            <BrickWall p={[22, 0, -24]} length={16} r={0} />
            <BrickWall p={[29.5, 0, -15]} length={18} r={Math.PI / 2} />
            <BrickWall p={[16, 0, -16]} length={6} r={Math.PI / 2} h={1.6} />
            <SignBoard p={[22, 3.6, -23.3]} text="SITUS KERATON SUROSOWAN" size={[7, 0.8]} bg="#7c2d12" fg="#fef3c7" font="bold 46px sans-serif" />
            {/* Danau / kolam peninggalan */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[22, 0.03, -18]}>
                <circleGeometry args={[3.6, 24]} />
                <meshStandardMaterial color="#38bdf8" roughness={0.15} metalness={0.2} />
            </mesh>

            {/* Royal Baroe: ruko warna-warni di sisi kiri & kanan */}
            {[
                [-17, 2, '#f59e0b', '#dc2626', 'SATE BANDENG'],
                [-17, -4.5, '#0ea5e9', '#f97316', 'RABEG KHAS'],
                [-17, 8.5, '#ec4899', '#16a34a', 'EMPING MELINJO'],
            ].map(([x, z, c, a, s], i) => (
                <ShopHouse key={`l${i}`} p={[x, 0, z]} c={c} awning={a} sign={s} r={Math.PI / 2} />
            ))}
            {[
                [17, 2, '#22c55e', '#dc2626', 'KOPI ROYAL'],
                [17, -4.5, '#a855f7', '#facc15', 'GIPANG'],
                [17, 8.5, '#f97316', '#0ea5e9', 'PECAK BANDENG'],
            ].map(([x, z, c, a, s], i) => (
                <ShopHouse key={`r${i}`} p={[x, 0, z]} c={c} awning={a} sign={s} r={-Math.PI / 2} />
            ))}
            <FoodCart p={[-12.5, 0, 9]} r={Math.PI / 2} c="#16a34a" />
            <FoodCart p={[12.5, 0, 9]} r={-Math.PI / 2} c="#dc2626" />
            <StringLights from={[-14.5, 5, -6]} to={[14.5, 5, -6]} count={14} />
            <StringLights from={[-14.5, 5, 6]} to={[14.5, 5, 6]} count={14} />
            {[-14.5, 14.5].map((x) => [-6, 6].map((z) => <Cyl key={`${x}${z}`} p={[x, 2.5, z]} a={[0.08, 0.08, 5, 6]} c="#334155" />))}

            {/* Jalan & lampu */}
            <Road p={[0, 0, 17]} length={70} width={6} r={Math.PI / 2} />
            {[-20, -10, 10, 20].map((x) => (
                <StreetLamp key={x} p={[x, 0, 13.4]} r={-Math.PI / 2} />
            ))}

            {/* Bangku & tanaman */}
            <Bench p={[-6, 0, 10.5]} r={Math.PI} />
            <Bench p={[6, 0, 10.5]} r={Math.PI} />
            {[[-25, -5], [-25, 6], [25, -6], [25, 6], [-24, -16], [-30, 14], [30, 14]].map(([x, z], i) => (
                <Tree key={i} p={[x, 0, z]} scale={1.2} leaf={i % 2 ? '#16a34a' : '#22c55e'} />
            ))}
            {[[-4, 21], [4, 21], [-14, 21], [14, 21]].map(([x, z], i) => (
                <PalmTree key={i} p={[x, 0, z]} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
                <Bush key={i} p={[-10 + i * 2.9, 0, -12.5]} scale={0.8} />
            ))}

            <Mountain p={[-40, 0, -85]} scale={1.8} c="#4d7c0f" />
            <Mountain p={[20, 0, -95]} scale={2.3} c="#3f6212" />
            <Cloud p={[-15, 24, -45]} scale={1.8} />
            <Cloud p={[25, 21, -35]} scale={1.4} speed={0.5} />
        </group>
    );
}
