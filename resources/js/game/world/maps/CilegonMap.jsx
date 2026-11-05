import React from 'react';
import { Box, Cyl, Sphere, Building, SignBoard, Smoke, StreetLamp, Road, Plaza, Tree, PalmTree, Bench, Fountain, Mountain, Cloud, Fence } from '../Primitives';

/*
 * BAB 1 — Kota Cilegon: Kota Baja.
 * Kawasan industri baja (tanur tiup, hot blast stove, cerobong berasap, tangki gas bola,
 * aula rolling mill, rak pipa, konveyor), gerbang kawasan, gedung HRD/Pusat Karier,
 * peti kemas, dan Pelabuhan dengan crane serta kapal kargo di tepi Selat Sunda.
 * Area tengah (x -12..12, z -11..11) dibiarkan lapang untuk NPC, papan materi, dan portal.
 */

function StripedChimney({ p, h = 16, r = 0.9 }) {
    const seg = 6;
    return (
        <group position={p}>
            {Array.from({ length: seg }).map((_, i) => (
                <Cyl key={i} p={[0, (h / seg) * (i + 0.5), 0]} a={[r * (1 - (i + 1) * 0.04), r * (1 - i * 0.04), h / seg, 14]} c={i % 2 === 0 ? '#dc2626' : '#f8fafc'} cast />
            ))}
            <Smoke p={[0, h + 0.3, 0]} color="#d1d5db" height={9} count={7} speed={0.7} />
        </group>
    );
}

function BlastFurnace({ p }) {
    return (
        <group position={p}>
            <Box p={[0, 1.5, 0]} s={[8, 3, 8]} c="#4b5563" cast receive />
            {/* Badan tanur */}
            <Cyl p={[0, 8, 0]} a={[2.2, 3.2, 10, 16]} c="#57534e" metal={0.4} rough={0.5} cast />
            <Cyl p={[0, 14, 0]} a={[1.2, 2.2, 2.4, 16]} c="#44403c" metal={0.4} cast />
            {/* Cincin platform kerja */}
            {[5, 8.5, 12].map((y) => (
                <Cyl key={y} p={[0, y, 0]} a={[3.6, 3.6, 0.2, 18]} c="#f59e0b" metal={0.3} />
            ))}
            {/* Pipa uptake & downcomer */}
            {[-1, 1].map((s) => (
                <group key={s}>
                    <Cyl p={[s * 0.9, 17, 0]} a={[0.3, 0.3, 4, 8]} c="#a8a29e" metal={0.5} />
                    <Cyl p={[s * 2.4, 16.5, 0]} r={[0, 0, s * 0.9]} a={[0.3, 0.3, 4, 8]} c="#a8a29e" metal={0.5} />
                </group>
            ))}
            {/* Lubang leleh besi yang menyala */}
            <Box p={[0, 3.6, 3.25]} s={[1.6, 1.0, 0.2]} c="#f97316" emissive="#f97316" ei={1.6} />
            <Box p={[0, 3.05, 4.4]} s={[0.6, 0.15, 2.4]} c="#fb923c" emissive="#ea580c" ei={1.4} />
            {/* Hot blast stoves */}
            {[-6.2, -9, -11.8].map((x) => (
                <group key={x} position={[x, 0, -1]}>
                    <Cyl p={[0, 5.5, 0]} a={[1.2, 1.3, 11, 14]} c="#78716c" metal={0.35} cast />
                    <Sphere p={[0, 11, 0]} a={[1.2, 14, 8]} c="#78716c" metal={0.35} />
                </group>
            ))}
            <Cyl p={[-6, 9, 1.6]} r={[0, 0, Math.PI / 2]} a={[0.35, 0.35, 12, 8]} c="#a8a29e" metal={0.5} />
        </group>
    );
}

function GasSphere({ p, c = '#e5e7eb' }) {
    return (
        <group position={p}>
            {[[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].map(([x, z], i) => (
                <Cyl key={i} p={[x, 2.2, z]} a={[0.15, 0.15, 4.4, 6]} c="#475569" />
            ))}
            <Sphere p={[0, 5, 0]} a={[3, 20, 14]} c={c} metal={0.5} rough={0.35} cast />
            <Cyl p={[0, 5, 0]} a={[3.05, 3.05, 0.25, 24]} c="#1d4ed8" />
        </group>
    );
}

function RollingMill({ p, w = 22, d = 9, h = 7, c = '#94a3b8', roof = '#1e40af', label }) {
    const teeth = 6;
    return (
        <group position={p}>
            <Box p={[0, h / 2, 0]} s={[w, h, d]} c={c} cast receive metal={0.3} rough={0.6} />
            {Array.from({ length: teeth }).map((_, i) => (
                <Box key={i} p={[-w / 2 + (w / teeth) * (i + 0.5), h + 0.9, 0]} r={[0, 0, 0.45]} s={[w / teeth, 0.25, d + 0.4]} c={roof} />
            ))}
            {/* Rusuk dinding */}
            {Array.from({ length: 8 }).map((_, i) => (
                <Box key={i} p={[-w / 2 + (w / 8) * (i + 0.5), h / 2, d / 2 + 0.06]} s={[0.15, h, 0.1]} c="#64748b" />
            ))}
            <Box p={[0, 2, d / 2 + 0.08]} s={[4, 4, 0.1]} c="#334155" />
            {label && <SignBoard p={[0, h - 1.2, d / 2 + 0.2]} text={label} size={[9, 1.1]} bg="#1e3a8a" />}
        </group>
    );
}

function PipeRack({ p, length = 20, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            {Array.from({ length: Math.floor(length / 4) + 1 }).map((_, i) => (
                <group key={i} position={[-length / 2 + i * 4, 0, 0]}>
                    <Box p={[0, 1.6, -0.8]} s={[0.2, 3.2, 0.2]} c="#475569" />
                    <Box p={[0, 1.6, 0.8]} s={[0.2, 3.2, 0.2]} c="#475569" />
                    <Box p={[0, 3.1, 0]} s={[0.2, 0.2, 1.8]} c="#475569" />
                </group>
            ))}
            {[['#facc15', -0.5], ['#16a34a', 0], ['#0ea5e9', 0.5]].map(([c, z]) => (
                <Cyl key={c} p={[0, 3.4, z]} r={[0, 0, Math.PI / 2]} a={[0.2, 0.2, length, 8]} c={c} metal={0.4} />
            ))}
        </group>
    );
}

function ContainerStack({ p, r = 0 }) {
    const colors = ['#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2'];
    const items = [];
    for (let x = 0; x < 2; x += 1) {
        for (let z = 0; z < 3; z += 1) {
            const levels = 1 + ((x + z) % 3);
            for (let y = 0; y < levels; y += 1) {
                items.push({ key: `${x}-${y}-${z}`, pos: [x * 2.6, 0.65 + y * 1.3, z * 6.2], c: colors[(x * 3 + z + y) % colors.length] });
            }
        }
    }
    return (
        <group position={p} rotation={[0, r, 0]}>
            {items.map((it) => (
                <group key={it.key} position={it.pos}>
                    <Box s={[2.4, 1.25, 6]} c={it.c} cast rough={0.6} metal={0.3} />
                    <Box p={[1.21, 0, 0]} s={[0.02, 1.0, 5.6]} c="#0f172a" opacity={0.25} />
                </group>
            ))}
        </group>
    );
}

function IndustrialGate({ p }) {
    return (
        <group position={p}>
            <Box p={[-5.5, 3, 0]} s={[1.4, 6, 1.4]} c="#1e3a8a" cast />
            <Box p={[5.5, 3, 0]} s={[1.4, 6, 1.4]} c="#1e3a8a" cast />
            <Box p={[0, 6.4, 0]} s={[13, 1.6, 1.2]} c="#1e40af" cast />
            <SignBoard p={[0, 6.4, 0.65]} text={'KAWASAN INDUSTRI BAJA\nKOTA CILEGON'} size={[11, 1.35]} bg="#1e3a8a" fg="#fde68a" font="bold 44px sans-serif" />
            <Box p={[0, 0.5, 0]} s={[9.6, 0.15, 0.15]} r={[0, 0, 0]} c="#facc15" />
            <Box p={[-8.5, 0.6, 0]} s={[3, 1.2, 0.3]} c="#cbd5e1" />
            <Box p={[8.5, 0.6, 0]} s={[3, 1.2, 0.3]} c="#cbd5e1" />
        </group>
    );
}

function HarborCrane({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z], i) => (
                <Box key={i} p={[x, 5, z]} s={[0.4, 10, 0.4]} c="#dc2626" cast />
            ))}
            <Box p={[0, 10.2, 0]} s={[4.8, 0.8, 4.8]} c="#b91c1c" />
            <Box p={[-5, 11, 0]} s={[16, 0.6, 1]} c="#ef4444" />
            <Box p={[1.5, 11.8, 0]} s={[2, 1.2, 1.6]} c="#f8fafc" />
        </group>
    );
}

function CargoShip({ p }) {
    return (
        <group position={p}>
            <Box p={[0, 1, 0]} s={[6, 2.6, 26]} c="#1e3a8a" cast />
            <Box p={[0, 0.05, 0]} s={[6.05, 0.6, 26.05]} c="#b91c1c" />
            <Box p={[0, 4, 9.5]} s={[5, 4, 4]} c="#f8fafc" cast />
            <Box p={[0, 5.4, 10.9]} s={[5.1, 0.6, 1.3]} c="#0f172a" />
            <Cyl p={[0, 7, 9.5]} a={[0.5, 0.6, 2, 10]} c="#f59e0b" />
            {[-7, -2, 3].map((z, i) => (
                <group key={z}>
                    <Box p={[-1.3, 3, z]} s={[2.4, 1.25, 4.5]} c={['#16a34a', '#f59e0b', '#dc2626'][i]} />
                    <Box p={[1.3, 3, z]} s={[2.4, 1.25, 4.5]} c={['#2563eb', '#7c3aed', '#0891b2'][i]} />
                    <Box p={[0, 4.25, z]} s={[2.4, 1.25, 4.5]} c={['#ea580c', '#0ea5e9', '#65a30d'][i]} />
                </group>
            ))}
        </group>
    );
}

export default function CilegonMap() {
    return (
        <group>
            {/* Laut Selat Sunda & dermaga (sisi barat) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-80, 0.01, 0]}>
                <planeGeometry args={[90, 200]} />
                <meshStandardMaterial color="#0369a1" roughness={0.2} metalness={0.3} />
            </mesh>
            <Box p={[-36, 0.4, 0]} s={[4, 0.8, 70]} c="#9ca3af" receive />
            <HarborCrane p={[-38, 0, -14]} r={0} />
            <HarborCrane p={[-38, 0, 8]} r={0} />
            <CargoShip p={[-46, 0, -4]} />

            {/* Alun-alun tengah tempat belajar */}
            <Plaza p={[0, 0.015, -1]} size={[13.5]} c="#d6d3d1" circle />
            <Plaza p={[0, 0.02, -1]} size={[11]} c="#e7e5e4" circle />
            {Array.from({ length: 10 }).map((_, i) => {
                const a = (i / 10) * Math.PI * 2;
                return <StreetLamp key={i} p={[Math.cos(a) * 13.8, 0, -1 + Math.sin(a) * 13.8]} r={-a + Math.PI} />;
            })}

            {/* Jalan utama menuju kawasan industri */}
            <Road p={[0, 0, -30]} length={36} width={6} />
            <Road p={[0, 0, 15]} length={70} width={5} r={Math.PI / 2} />
            <IndustrialGate p={[0, 0, -15]} />

            {/* Kompleks pabrik baja (kiri belakang) */}
            <BlastFurnace p={[-17, 0, -28]} />
            <StripedChimney p={[-7.5, 0, -36]} h={20} r={1} />
            <StripedChimney p={[-4.5, 0, -38]} h={17} r={0.85} />
            <RollingMill p={[-18, 0, -14.5]} w={14} d={6} h={5.5} label="ROLLING MILL" />
            <PipeRack p={[-14, 0, -21]} length={20} />
            <GasSphere p={[-26, 0, -14]} />
            <GasSphere p={[-26, 0, -5]} c="#f1f5f9" />
            {/* Konveyor bijih besi */}
            <Box p={[-25, 4, -24]} r={[0, 0.3, 0.35]} s={[14, 0.6, 1.2]} c="#71717a" cast />
            <Box p={[-31, 1.2, -26]} s={[5, 2.4, 5]} c="#7c2d12" />

            {/* Gedung HRD / Pusat Karier & perkantoran (kanan belakang) */}
            <Building p={[17, 0, -22]} size={[8, 18, 7]} c="#0c4a6e" lit="#7dd3fc" roof="#082f49" metal={0.5} />
            <SignBoard p={[17, 5, -18.35]} text={'PUSAT KARIER\n& HRD INDUSTRI'} size={[6.5, 1.8]} bg="#0369a1" fg="#ffffff" font="bold 48px sans-serif" glow />
            <Building p={[25, 0, -14]} size={[6, 12, 6]} c="#1e293b" lit="#fde68a" roof="#0f172a" />
            <Building p={[9, 0, -30]} size={[7, 10, 6]} c="#334155" lit="#e0f2fe" />
            <RollingMill p={[22, 0, -34]} w={20} d={9} h={7} c="#cbd5e1" roof="#0f766e" label="PABRIK BAJA LEMBARAN" />
            <StripedChimney p={[30, 0, -28]} h={15} r={0.8} />

            {/* Peti kemas & area logistik (kiri depan) */}
            <ContainerStack p={[-27, 0, 6]} />
            <Fence p={[-21, 0, 12]} length={14} r={Math.PI / 2} c="#facc15" />

            {/* Taman kota & air mancur (kanan depan) */}
            <Plaza p={[21, 0.016, 8]} size={[12, 14]} c="#bbf7d0" />
            <Fountain p={[21, 0, 8]} scale={0.9} />
            <Bench p={[16.5, 0, 6]} r={Math.PI / 2} />
            <Bench p={[25.5, 0, 6]} r={-Math.PI / 2} />
            {[[16, 13], [26, 13], [16, 2.5], [26, 2.5]].map(([x, z], i) => (
                <Tree key={i} p={[x, 0, z]} scale={1.1} />
            ))}
            {[[-15, 18], [-8, 19], [8, 19], [15, 18], [28, 18]].map(([x, z], i) => (
                <PalmTree key={i} p={[x, 0, z]} scale={1.1} />
            ))}

            {/* Latar belakang: perbukitan & awan */}
            <Mountain p={[-30, 0, -80]} scale={1.6} c="#4d7c0f" />
            <Mountain p={[10, 0, -90]} scale={2.1} c="#3f6212" />
            <Mountain p={[45, 0, -75]} scale={1.4} c="#4d7c0f" />
            <Cloud p={[-20, 22, -40]} scale={1.6} />
            <Cloud p={[15, 26, -55]} scale={2} speed={0.3} />
            <Cloud p={[40, 20, -30]} scale={1.3} speed={0.5} />
        </group>
    );
}
