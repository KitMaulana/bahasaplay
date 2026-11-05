import React from 'react';
import { Box, Cyl, Cone, Sphere, SignBoard, StreetLamp, Road, Plaza, Tree, PalmTree, Bench, Mountain, Cloud, Bush } from '../Primitives';

/*
 * BAB 4 — Kabupaten Lebak: Kawasan Adat Baduy & Rangkasbitung.
 * Penggambaran santun & menghormati adat budaya Baduy:
 * Rumah panggung bilik kayu bambu (Imah Adat), Lumbung Padi (Leuit Adat) beratap ijuk kirai,
 * jembatan bambu gantung di atas sungai jernih, bebatuan sungai, hutan tropis hijau asri,
 * serta jalan setapak batu kali.
 */

function BaduyHouse({ p, r = 0, scale = 1 }) {
    return (
        <group position={p} rotation={[0, r, 0]} scale={scale}>
            {/* Tiang umpak panggung kayu */}
            {[
                [-2.0, -1.8], [0, -1.8], [2.0, -1.8],
                [-2.0, 0], [0, 0], [2.0, 0],
                [-2.0, 1.8], [0, 1.8], [2.0, 1.8]
            ].map(([x, z], i) => (
                <group key={i} position={[x, 0, z]}>
                    <Cyl p={[0, 0.25, 0]} a={[0.3, 0.35, 0.5, 6]} c="#57534e" rough={0.9} />
                    <Cyl p={[0, 0.8, 0]} a={[0.15, 0.15, 0.8, 6]} c="#78350f" rough={0.9} />
                </group>
            ))}
            {/* Lantai papan kayu/bambu */}
            <Box p={[0, 1.25, 0]} s={[4.6, 0.2, 4.2]} c="#a16207" rough={0.85} />
            {/* Dinding bilik sasak anyaman bambu */}
            <Box p={[0, 2.4, 0]} s={[4.4, 2.1, 4.0]} c="#d6d3d1" rough={0.9} />
            {/* Pintu kayu */}
            <Box p={[0, 2.1, 2.02]} s={[1.1, 1.6, 0.08]} c="#78350f" />
            {/* Atap ijuk & kirai bertingkat */}
            <mesh position={[0, 4.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[3.8, 2.2, 4]} />
                <meshStandardMaterial color="#451a03" roughness={0.95} flatShading />
            </mesh>
            <mesh position={[0, 4.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[2.0, 1.2, 4]} />
                <meshStandardMaterial color="#291002" roughness={0.95} flatShading />
            </mesh>
            {/* Tangga bambu masuk */}
            <Box p={[0, 0.6, 2.4]} r={[0.4, 0, 0]} s={[1.0, 0.15, 1.2]} c="#a16207" />
        </group>
    );
}

function LeuitAdat({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            {/* 4 Tiang kayu penyangga leuit */}
            {[[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]].map(([x, z], i) => (
                <group key={i} position={[x, 0, z]}>
                    <Cyl p={[0, 0.3, 0]} a={[0.25, 0.3, 0.6, 6]} c="#78716c" />
                    <Cyl p={[0, 1.1, 0]} a={[0.12, 0.12, 1.0, 6]} c="#713f12" />
                    {/* Gelebeg (cakram kayu anti-tikus) */}
                    <Cyl p={[0, 1.65, 0]} a={[0.45, 0.45, 0.1, 12]} c="#451a03" />
                </group>
            ))}
            {/* Ruang lumbung padi kayu */}
            <Box p={[0, 2.5, 0]} s={[2.6, 1.6, 2.6]} c="#a16207" rough={0.9} cast />
            {/* Atap kirai leuit melengkung tradisional */}
            <mesh position={[0, 3.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[2.5, 1.8, 4]} />
                <meshStandardMaterial color="#451a03" roughness={0.95} flatShading />
            </mesh>
            <SignBoard p={[0, 2.5, 1.35]} text="LEUIT ADAT\nLumbung Pangan" size={[2.0, 0.7]} bg="#78350f" fg="#fef08a" font="bold 36px sans-serif" />
        </group>
    );
}

function BambooBridge({ p, length = 16 }) {
    return (
        <group position={p}>
            {/* Tiang pancang bambu silang di sungai */}
            {[-length / 3, 0, length / 3].map((x) => (
                <group key={x} position={[x, 0, 0]}>
                    <Cyl p={[0, 1.0, -1.6]} r={[0.25, 0, 0]} a={[0.12, 0.14, 2.8, 8]} c="#ca8a04" />
                    <Cyl p={[0, 1.0, 1.6]} r={[-0.25, 0, 0]} a={[0.12, 0.14, 2.8, 8]} c="#ca8a04" />
                </group>
            ))}
            {/* Lantai jembatan bambu */}
            <Box p={[0, 1.8, 0]} s={[length, 0.25, 2.8]} c="#eab308" rough={0.8} />
            {/* Pegangan jembatan bambu kiri & kanan */}
            <Cyl p={[0, 2.7, -1.35]} r={[0, 0, Math.PI / 2]} a={[0.08, 0.08, length, 8]} c="#ca8a04" />
            <Cyl p={[0, 2.7, 1.35]} r={[0, 0, Math.PI / 2]} a={[0.08, 0.08, length, 8]} c="#ca8a04" />
        </group>
    );
}

export default function LebakMap() {
    return (
        <group>
            {/* Sungai alami mengalir jernih (sisi barat ke timur di belakang) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -28]}>
                <planeGeometry args={[140, 10]} />
                <meshStandardMaterial color="#0284c7" roughness={0.25} metalness={0.4} />
            </mesh>
            {/* Jembatan bambu menyeberangi sungai */}
            <BambooBridge p={[0, 0, -28]} length={18} />

            {/* Bebatuan sungai alami */}
            {[[-14, -28], [-8, -27], [7, -29], [15, -28], [24, -27]].map(([x, z], i) => (
                <Sphere key={i} p={[x, 0.4, z]} a={[1.1, 8, 6]} s={[1.4, 0.6, 1.1]} c="#78716c" rough={0.9} />
            ))}

            {/* Gapura selamat datang Kawasan Adat Baduy */}
            <group position={[0, 0, 18]}>
                <Cyl p={[-4.5, 2.5, 0]} a={[0.3, 0.35, 5, 8]} c="#713f12" />
                <Cyl p={[4.5, 2.5, 0]} a={[0.3, 0.35, 5, 8]} c="#713f12" />
                <Box p={[0, 4.8, 0]} s={[11, 0.8, 0.8]} c="#451a03" />
                <SignBoard p={[0, 4.8, 0.45]} text={"WILUJENG SUMPING\nKAWASAN ADAT KABUPATEN LEBAK"} size={[9.5, 1.4]} bg="#451a03" fg="#fde68a" font="bold 42px sans-serif" />
            </group>

            {/* Plaza Utama Batu Kali & Jalan Setapak */}
            <Plaza p={[0, 0.015, -6]} size={[20, 16]} c="#d6d3d1" />
            <Road p={[0, 0, 4]} length={24} width={5} c="#78716c" />
            <Road p={[-20, 0, 8]} length={28} width={4} r={Math.PI / 2} c="#78716c" />
            <Road p={[20, 0, 8]} length={28} width={4} r={Math.PI / 2} c="#78716c" />

            {/* Rumah Panggung Adat Baduy (Imah) */}
            <BaduyHouse p={[-22, 0, -12]} r={0.3} scale={1.1} />
            <BaduyHouse p={[-18, 0, -22]} r={-0.2} scale={1.0} />
            <BaduyHouse p={[22, 0, -12]} r={-0.3} scale={1.1} />
            <BaduyHouse p={[18, 0, -22]} r={0.2} scale={1.0} />

            {/* Deretan Leuit Adat (Lumbung Pangan) */}
            <LeuitAdat p={[-10, 0, -18]} r={0.1} />
            <LeuitAdat p={[10, 0, -18]} r={-0.1} />

            {/* Gazebo & Tempat Istirahat Bambu */}
            <group position={[0, 0, -14]}>
                {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z], i) => (
                    <Cyl key={i} p={[x, 1.2, z]} a={[0.12, 0.14, 2.4, 8]} c="#ca8a04" />
                ))}
                <Box p={[0, 0.6, 0]} s={[4.2, 0.2, 4.2]} c="#a16207" />
                <mesh position={[0, 2.8, 0]} rotation={[0, Math.PI / 4, 0]}>
                    <coneGeometry args={[3.2, 1.6, 4]} />
                    <meshStandardMaterial color="#451a03" roughness={0.9} />
                </mesh>
            </group>

            {/* Hutan Lindung Tropis Asri di Belakang Sungai */}
            {[-32, -24, -16, -8, 0, 8, 16, 24, 32].map((x, i) => (
                <group key={i} position={[x, 0, -36]}>
                    <Tree p={[0, 0, 0]} scale={1.4 + (i % 3) * 0.2} c="#166534" />
                    <Bush p={[2, 0, 2]} scale={1.2} c="#15803d" />
                </group>
            ))}

            {/* Pepohonan Asri di Sekitar Kampung */}
            {[[-28, 0, 2], [-28, 0, 16], [28, 0, 2], [28, 0, 16]].map(([x, y, z], i) => (
                <Tree key={i} p={[x, y, z]} scale={1.2} c="#15803d" />
            ))}

            {/* Latar Belakang Perbukitan Halimun Salak */}
            <Mountain p={[-35, 0, -80]} scale={2.0} c="#166534" />
            <Mountain p={[0, 0, -90]} scale={2.6} c="#14532d" />
            <Mountain p={[35, 0, -80]} scale={2.2} c="#166534" />
            <Cloud p={[-18, 22, -45]} scale={1.6} />
            <Cloud p={[14, 25, -55]} scale={2.0} speed={0.25} />
        </group>
    );
}
