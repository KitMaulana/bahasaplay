import React from 'react';
import { Box, Cyl, Cone, Sphere, SignBoard, StreetLamp, Road, Plaza, Tree, PalmTree, Bench, Fountain, Mountain, Cloud, Bush } from '../Primitives';

/*
 * BAB 5 — Kabupaten Pandeglang: Taman Literasi & Kawasan Budaya / Ujung Kulon Heritage.
 * Tempat siswa mempelajari Novel, sudut pandang, tokoh tiga dimensi, dan penulisan dialog.
 * Dihiasi:
 * - Monumen Patung Badak Jawa Cula Satu megah (ikon kebanggaan Pandeglang)
 * - Pendopo Sastra & Literasi beratap joglo megah
 * - Gazebo membaca kayu, taman bunga, kolam air mancur
 * - Latar perbukitan megah Gunung Karang
 */

function RhinoStatue({ p }) {
    return (
        <group position={p}>
            {/* Pedestal pilar marmer bertingkat */}
            <Box p={[0, 0.4, 0]} s={[6, 0.8, 6]} c="#475569" receive />
            <Box p={[0, 1.2, 0]} s={[4.8, 0.8, 4.8]} c="#334155" />
            <Box p={[0, 2.0, 0]} s={[3.8, 0.8, 3.8]} c="#1e293b" />
            <SignBoard p={[0, 1.2, 2.45]} text="MONUMEN BADAK CULA SATU\nIkon Kabupaten Pandeglang" size={[4.2, 0.7]} bg="#0f172a" fg="#38bdf8" font="bold 32px sans-serif" />

            {/* Patung Badak Jawa Stylized Low-Poly */}
            <group position={[0, 2.5, 0]}>
                {/* Kaki-kaki kokoh */}
                {[[-0.9, -1.2], [0.9, -1.2], [-0.9, 0.8], [0.9, 0.8]].map(([x, z], i) => (
                    <Box key={i} p={[x, 0.6, z]} s={[0.55, 1.2, 0.6]} c="#94a3b8" cast />
                ))}
                {/* Badan besar badak */}
                <Box p={[0, 1.6, -0.2]} s={[2.2, 1.5, 3.2]} c="#94a3b8" cast />
                {/* Lipatan kulit khas badak jawa */}
                <Box p={[0, 1.7, -0.2]} s={[2.25, 1.2, 0.3]} c="#64748b" />
                <Box p={[0, 1.7, 0.5]} s={[2.25, 1.2, 0.3]} c="#64748b" />
                {/* Kepala badak */}
                <Box p={[0, 1.9, 1.8]} s={[1.4, 1.2, 1.4]} c="#94a3b8" cast />
                {/* Cula Satu khas badak Pandeglang (menghadap ke depan melengkung) */}
                <group position={[0, 2.6, 2.3]} rotation={[0.4, 0, 0]}>
                    <Cone p={[0, 0, 0]} a={[0.3, 0.9, 8]} c="#e2e8f0" flat />
                </group>
                {/* Telinga kecil */}
                <Cone p={[-0.6, 2.5, 1.4]} a={[0.15, 0.35, 6]} c="#64748b" />
                <Cone p={[0.6, 2.5, 1.4]} a={[0.15, 0.35, 6]} c="#64748b" />
                {/* Ekor */}
                <Box p={[0, 1.2, -1.8]} r={[-0.3, 0, 0]} s={[0.15, 0.8, 0.15]} c="#64748b" />
            </group>
        </group>
    );
}

function PendopoSastra({ p }) {
    return (
        <group position={p}>
            {/* Lantai teras pendopo bertingkat */}
            <Box p={[0, 0.3, 0]} s={[16, 0.6, 14]} c="#e2e8f0" receive />
            <Box p={[0, 0.7, 0]} s={[14, 0.25, 12]} c="#f8fafc" />

            {/* 12 Tiang kayu pendopo */}
            {[
                [-6, -5], [-2, -5], [2, -5], [6, -5],
                [-6, 0], [6, 0],
                [-6, 5], [-2, 5], [2, 5], [6, 5]
            ].map(([x, z], i) => (
                <Cyl key={i} p={[x, 2.2, z]} a={[0.2, 0.2, 3.0, 8]} c="#78350f" cast />
            ))}

            {/* Atap Joglo Tumpang Megah */}
            <mesh position={[0, 4.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[11, 2.2, 4]} />
                <meshStandardMaterial color="#92400e" roughness={0.7} flatShading />
            </mesh>
            <mesh position={[0, 5.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[7, 2.0, 4]} />
                <meshStandardMaterial color="#b45309" roughness={0.7} flatShading />
            </mesh>
            <mesh position={[0, 7.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[3.8, 1.6, 4]} />
                <meshStandardMaterial color="#78350f" roughness={0.7} flatShading />
            </mesh>
            <SignBoard p={[0, 3.4, 6.05]} text="PENDOPO SASTRA & NOVEL\nKABUPATEN PANDEGLANG" size={[7.5, 1.2]} bg="#78350f" fg="#fde68a" font="bold 38px sans-serif" />
        </group>
    );
}

function ReadingGazebo({ p }) {
    return (
        <group position={p}>
            <Box p={[0, 0.3, 0]} s={[4, 0.6, 4]} c="#cbd5e1" />
            {[[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]].map(([x, z], i) => (
                <Cyl key={i} p={[x, 1.6, z]} a={[0.12, 0.12, 2.2, 6]} c="#78350f" />
            ))}
            <mesh position={[0, 3.3, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[3.2, 1.6, 4]} />
                <meshStandardMaterial color="#0284c7" flatShading />
            </mesh>
            <Bench p={[0, 0.7, 0]} scale={0.9} />
        </group>
    );
}

export default function PandeglangMap() {
    return (
        <group>
            {/* Latar Belakang Gunung Karang yang Megah */}
            <Mountain p={[-25, 0, -85]} scale={2.5} c="#1e3a5f" />
            <Mountain p={[15, 0, -95]} scale={3.2} c="#1e293b" />
            <Mountain p={[50, 0, -85]} scale={2.4} c="#1e3a5f" />
            <Cloud p={[-15, 24, -40]} scale={1.8} />
            <Cloud p={[20, 26, -50]} scale={2.2} speed={0.3} />

            {/* Gapura Masuk Taman Literasi */}
            <group position={[0, 0, 18]}>
                <Box p={[-5, 3, 0]} s={[1.4, 6, 1.4]} c="#0369a1" />
                <Box p={[5, 3, 0]} s={[1.4, 6, 1.4]} c="#0369a1" />
                <Box p={[0, 6.2, 0]} s={[12, 1.2, 1.2]} c="#0284c7" />
                <SignBoard p={[0, 6.2, 0.65]} text={"TAMAN LITERASI PANDEGLANG\nDUNIA SASTRA & KARYA NOVEL"} size={[10.5, 1.3]} bg="#0369a1" fg="#ffffff" font="bold 40px sans-serif" />
            </group>

            {/* Plaza Utama Berpaving & Jalan Taman */}
            <Plaza p={[0, 0.015, -4]} size={[18, 16]} c="#e2e8f0" />
            <Road p={[0, 0, 5]} length={26} width={5} c="#cbd5e1" />
            <Road p={[-20, 0, 8]} length={28} width={4} r={Math.PI / 2} c="#cbd5e1" />
            <Road p={[20, 0, 8]} length={28} width={4} r={Math.PI / 2} c="#cbd5e1" />

            {/* Monumen Badak Cula Satu di Plaza Tengah Belakang */}
            <RhinoStatue p={[0, 0, -28]} />

            {/* Pendopo Sastra di Sisi Kanan Belakang */}
            <PendopoSastra p={[24, 0, -18]} />

            {/* Gazebo-Gazebo Membaca */}
            <ReadingGazebo p={[-22, 0, -16]} />
            <ReadingGazebo p={[-24, 0, -4]} />

            {/* Kolam Air Mancur Literasi di Sisi Kiri Depan */}
            <Plaza p={[-20, 0.016, 2]} size={[10, 10]} c="#bae6fd" circle />
            <Fountain p={[-20, 0, 2]} scale={1.1} />

            {/* Lampu Taman & Bangku Membaca */}
            {[-12, -4, 4, 12].map((x, i) => (
                <group key={i}>
                    <StreetLamp p={[x, 0, 14]} r={0} />
                    <Bench p={[x + 2, 0, 12]} r={0} />
                </group>
            ))}

            {/* Pohon Peneduh & Taman Bunga */}
            {[
                [-14, 0, -8], [-14, 0, -24],
                [14, 0, -8], [14, 0, -24],
                [-28, 0, 14], [28, 0, 14],
                [-8, 0, 16], [8, 0, 16]
            ].map(([x, y, z], i) => (
                <group key={i} position={[x, y, z]}>
                    <Tree scale={1.2 + (i % 3) * 0.15} c={i % 2 === 0 ? '#15803d' : '#166534'} />
                    <Bush p={[1.4, 0, 1.4]} scale={0.9} c="#22c55e" />
                </group>
            ))}

            {/* Pohon Palem Tropis */}
            {[-32, -18, 18, 32].map((x, i) => (
                <PalmTree key={i} p={[x, 0, -32]} scale={1.2} />
            ))}
        </group>
    );
}
