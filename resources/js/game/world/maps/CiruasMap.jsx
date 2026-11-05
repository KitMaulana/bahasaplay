import React from 'react';
import { Box, Cyl, Cone, Sphere, Building, SignBoard, StreetLamp, Road, Plaza, Tree, Bench, Mountain, Cloud, Bush } from '../Primitives';

/*
 * BAB 6 — Kabupaten Serang: Kampus SMAN 1 Ciruas (SMANCIR).
 * Miniatur 3D lingkungan SMAN 1 Ciruas:
 * - Gapura gerbang masuk sekolah resmi dengan nama SMAN 1 CIRUAS
 * - Lapangan upacara bergaris dengan tiang bendera Merah Putih
 * - Gedung sekolah 2 lantai warna biru-putih khas SMANCIR
 * - Gedung Perpustakaan Sekolah "Ki Hajar Dewantara"
 * - Koridor kanopi, bangku siswa, dan pohon peneduh rindang
 */

function SchoolMainBuilding({ p }) {
    return (
        <group position={p}>
            {/* Lantai dasar ruang TU & guru */}
            <Building p={[0, 0, 0]} size={[24, 7, 7]} c="#f8fafc" lit="#7dd3fc" roof="#0284c7" />
            {/* Lantai 2 ruang kelas bertingkat */}
            <Building p={[0, 7, 0]} size={[22, 6, 6.5]} c="#e0f2fe" lit="#bae6fd" roof="#1e40af" />
            {/* Kanopi teras depan */}
            <Box p={[0, 3.8, 4.2]} s={[24, 0.4, 2.2]} c="#0284c7" />
            {[-10, -5, 0, 5, 10].map((x) => (
                <Cyl key={x} p={[x, 1.9, 5.1]} a={[0.15, 0.15, 3.8, 8]} c="#f8fafc" />
            ))}
            {/* Papan nama gedung sekolah */}
            <SignBoard p={[0, 11.5, 3.4]} text="SMAN 1 CIRUAS\nGedung Pembelajaran & Literasi" size={[11, 1.4]} bg="#1e3a8a" fg="#ffffff" font="bold 42px sans-serif" glow />
        </group>
    );
}

function FlagPole({ p }) {
    return (
        <group position={p}>
            {/* Dudukan pedestal tiang bendera bertingkat */}
            <Box p={[0, 0.2, 0]} s={[3, 0.4, 3]} c="#e2e8f0" receive />
            <Box p={[0, 0.5, 0]} s={[2, 0.3, 2]} c="#cbd5e1" />
            {/* Tiang logam perak */}
            <Cyl p={[0, 5.5, 0]} a={[0.07, 0.12, 10, 8]} c="#f8fafc" metal={0.8} rough={0.2} />
            <Sphere p={[0, 10.6, 0]} a={[0.18, 8, 8]} c="#facc15" metal={0.8} />
            {/* Bendera Merah Putih berkibar */}
            <group position={[1.0, 9.4, 0]}>
                <Box p={[0, 0.45, 0]} s={[2.0, 0.7, 0.05]} c="#ef4444" />
                <Box p={[0, -0.25, 0]} s={[2.0, 0.7, 0.05]} c="#ffffff" />
            </group>
        </group>
    );
}

export default function CiruasMap() {
    return (
        <group>
            {/* Gapura Gerbang Utama SMAN 1 Ciruas di Depan */}
            <group position={[0, 0, 18]}>
                <Box p={[-6, 3.2, 0]} s={[1.6, 6.4, 1.6]} c="#1e40af" cast />
                <Box p={[6, 3.2, 0]} s={[1.6, 6.4, 1.6]} c="#1e40af" cast />
                <Box p={[0, 6.8, 0]} s={[14.5, 1.4, 1.4]} c="#1d4ed8" cast />
                <SignBoard p={[0, 6.8, 0.75]} text={"KAMPUS SMAN 1 CIRUAS\nKABUPATEN SERANG"} size={[12, 1.5]} bg="#1e3a8a" fg="#facc15" font="bold 44px sans-serif" glow />
                {/* Pos Satpam */}
                <Box p={[-9.5, 1.6, 0]} s={[3.2, 3.2, 3.2]} c="#f1f5f9" />
                <Box p={[-9.5, 3.4, 0]} s={[3.6, 0.4, 3.6]} c="#0284c7" />
            </group>

            {/* Lapangan Upacara & Olahraga (Tengah) */}
            <Plaza p={[0, 0.015, -4]} size={[24, 18]} c="#64748b" />
            {/* Garis lapangan basket/voli */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -4]}>
                <planeGeometry args={[20, 14]} />
                <meshStandardMaterial color="#94a3b8" />
            </mesh>
            {/* Tiang bendera di pinggir lapangan upacara */}
            <FlagPole p={[0, 0, -12]} />

            {/* Jalan Utama dan Trotoar Sekolah */}
            <Road p={[0, 0, 5]} length={26} width={5} c="#cbd5e1" />
            <Road p={[-20, 0, 8]} length={28} width={4} r={Math.PI / 2} c="#cbd5e1" />
            <Road p={[20, 0, 8]} length={28} width={4} r={Math.PI / 2} c="#cbd5e1" />

            {/* Gedung Utama Sekolah (Utara Belakang) */}
            <SchoolMainBuilding p={[0, 0, -28]} />

            {/* Gedung Perpustakaan Ki Hajar Dewantara (Sayap Kiri) */}
            <group position={[-25, 0, -16]}>
                <Building size={[9, 8, 8]} c="#f8fafc" lit="#38bdf8" roof="#0369a1" />
                <SignBoard p={[0, 5.5, 4.2]} text="PERPUSTAKAAN\nKI HAJAR DEWANTARA" size={[7.2, 1.2]} bg="#0369a1" fg="#ffffff" font="bold 36px sans-serif" />
            </group>

            {/* Gedung Lab Komputer & Bahasa (Sayap Kanan) */}
            <group position={[25, 0, -16]}>
                <Building size={[9, 8, 8]} c="#f8fafc" lit="#fde68a" roof="#0284c7" />
                <SignBoard p={[0, 5.5, 4.2]} text="LAB BAHASA & MULTIMEDIA\nSMAN 1 CIRUAS" size={[7.2, 1.2]} bg="#0284c7" fg="#ffffff" font="bold 36px sans-serif" />
            </group>

            {/* Lampu Taman & Bangku Koridor Siswa */}
            {[-12, -4, 4, 12].map((x, i) => (
                <group key={i}>
                    <StreetLamp p={[x, 0, 14]} r={0} />
                    <Bench p={[x + 1.8, 0, 12]} r={0} />
                </group>
            ))}

            {/* Pepohonan Peneduh Rindang Sekolah */}
            {[
                [-14, 0, -6], [-14, 0, -22],
                [14, 0, -6], [14, 0, -22],
                [-28, 0, 14], [28, 0, 14],
                [-7, 0, 16], [7, 0, 16]
            ].map(([x, y, z], i) => (
                <group key={i} position={[x, y, z]}>
                    <Tree scale={1.25 + (i % 2) * 0.15} c="#16a34a" />
                    <Bush p={[1.2, 0, 1.2]} scale={0.9} c="#22c55e" />
                </group>
            ))}

            {/* Latar Belakang Awan Lembut */}
            <Cloud p={[-20, 24, -40]} scale={1.8} />
            <Cloud p={[18, 26, -50]} scale={2.2} speed={0.3} />
        </group>
    );
}
