import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';

import CilegonMap from './world/maps/CilegonMap';
import SerangMap from './world/maps/SerangMap';
import TangselMap from './world/maps/TangselMap';
import LebakMap from './world/maps/LebakMap';
import PandeglangMap from './world/maps/PandeglangMap';
import CiruasMap from './world/maps/CiruasMap';
import { Box, Cyl, Cone, Sphere, SignBoard, StreetLamp, Road, Plaza, Tree, Bench } from './world/Primitives';

/*
 * Pemilih peta tematik 3D untuk seluruh BAB (1 s.d. 6):
 * - BAB 1: Kota Cilegon (Kawasan Industri Baja Krakatau Steel & Alun-Alun)
 * - BAB 2: Kota Serang (Kawasan Kesultanan Banten Lama & Royal Baroe)
 * - BAB 3: Kota Tangerang Selatan (Gading Serpong Digital & AI Monument)
 * - BAB 4: Kabupaten Lebak (Kawasan Adat Baduy & Rangkasbitung)
 * - BAB 5: Kabupaten Pandeglang (Taman Literasi & Monumen Badak Cula Satu)
 * - BAB 6: Kabupaten Serang (Kampus SMAN 1 Ciruas)
 */
function MapStructures({ mapKey }) {
    if (mapKey === 'cilegon' || mapKey === 'alun_cilegon' || mapKey === 'kawasan_industri' || mapKey === 'pusat_kota') {
        return <CilegonMap />;
    }
    if (mapKey === 'banten_lama' || mapKey === 'royal_baroe' || mapKey === 'alun_serang' || mapKey === 'masjid_agung') {
        return <SerangMap />;
    }
    if (mapKey === 'gading_serpong' || mapKey === 'alun_tangsel' || mapKey === 'kawasan_bisnis') {
        return <TangselMap />;
    }
    if (mapKey === 'baduy' || mapKey === 'alun_lebak' || mapKey === 'kampung') {
        return <LebakMap />;
    }
    if (mapKey === 'pandeglang' || mapKey === 'alun_pandeglang' || mapKey === 'taman_literasi' || mapKey === 'pojok_baca') {
        return <PandeglangMap />;
    }
    if (mapKey === 'smancir' || mapKey === 'kampus_smancir' || mapKey === 'gerbang_lapangan' || mapKey === 'tata_usaha') {
        return <CiruasMap />;
    }
    return <CilegonMap />;
}

/*
 * Papan Rambu Penunjuk Jalan 3D di Persimpangan Utama
 */
function DirectionalSignpost({ p = [0, 0, 6] }) {
    return (
        <group position={p}>
            {/* Tiang utama tiang kayu/baja */}
            <Cyl p={[0, 1.8, 0]} a={[0.15, 0.18, 3.6, 8]} c="#334155" />
            <Box p={[0, 0.15, 0]} s={[1.2, 0.3, 1.2]} c="#1e293b" />

            {/* Bilah Panah 1: Menunjuk ke Sayap Barat (Zona Latihan) */}
            <group position={[-0.8, 2.9, 0]} rotation={[0, 0, 0]}>
                <Box p={[0, 0, 0]} s={[2.0, 0.45, 0.08]} c="#f59e0b" />
                <SignBoard p={[0, 0, 0.06]} text="⬅️ ZONA LATIHAN (34m)" size={[1.9, 0.38]} bg="#d97706" fg="#ffffff" font="bold 30px sans-serif" />
            </group>

            {/* Bilah Panah 2: Menunjuk ke Utara (Koridor Materi) */}
            <group position={[0, 2.3, -0.6]} rotation={[0, Math.PI / 2, 0]}>
                <Box p={[0, 0, 0]} s={[2.2, 0.45, 0.08]} c="#0284c7" />
                <SignBoard p={[0, 0, 0.06]} text="⬆️ POS MATERI 1-3 (20m)" size={[2.1, 0.38]} bg="#0369a1" fg="#ffffff" font="bold 30px sans-serif" />
            </group>

            {/* Bilah Panah 3: Menunjuk ke Sayap Timur (Gerbang Ujian) */}
            <group position={[0.8, 1.7, 0]} rotation={[0, 0, 0]}>
                <Box p={[0, 0, 0]} s={[2.0, 0.45, 0.08]} c="#10b981" />
                <SignBoard p={[0, 0, 0.06]} text="GERBANG UJIAN (34m) ➡️" size={[1.9, 0.38]} bg="#059669" fg="#ffffff" font="bold 30px sans-serif" />
            </group>
        </group>
    );
}

/*
 * Distrik Latihan Soal 3D (Sayap Barat)
 */
function PracticeDistrict({ p = [-34, 0, 10], practiceReady, onTrigger }) {
    const ringRef = useRef();
    useFrame((_, dt) => {
        if (ringRef.current) ringRef.current.rotation.y += dt * 0.8;
    });

    return (
        <group position={p}>
            {/* Plaza Latihan Soal Oranye Keemasan */}
            <Plaza p={[0, 0.02, 0]} size={[15, 15]} c="#fef3c7" />
            <Plaza p={[0, 0.03, 0]} size={[12, 12]} c="#fde68a" />

            {/* Jalan penghubung ke persimpangan tengah */}
            <Road p={[15, 0, 0]} length={18} width={4} r={Math.PI / 2} c="#cbd5e1" />

            {/* Gapura Terminal Latihan Soal */}
            <Box p={[-3.6, 2.5, -2]} s={[0.8, 5, 0.8]} c="#d97706" cast />
            <Box p={[3.6, 2.5, -2]} s={[0.8, 5, 0.8]} c="#d97706" cast />
            <Box p={[0, 5.2, -2]} s={[8.6, 1.0, 1.2]} c="#f59e0b" cast />
            <SignBoard p={[0, 5.2, -1.35]} text="TERMINAL LATIHAN SOAL\nSyarat KKM 75 · Maks. 10 Soal" size={[7.8, 0.9]} bg="#b45309" fg="#ffffff" font="bold 36px sans-serif" glow />

            {/* Kios Terminal Interaktif 3D di Tengah */}
            <group position={[0, 0, 0]}>
                <Box p={[0, 0.6, 0]} s={[1.8, 1.2, 1.2]} c="#1e293b" cast />
                {/* Layar Terminal Menyala */}
                <Box p={[0, 1.4, 0]} r={[-0.35, 0, 0]} s={[1.6, 1.1, 0.2]} c="#0f172a" />
                <Box p={[0, 1.4, 0.08]} r={[-0.35, 0, 0]} s={[1.4, 0.9, 0.05]} c={practiceReady ? '#f59e0b' : '#64748b'} emissive={practiceReady ? '#d97706' : '#334155'} ei={1.2} />
                
                {/* Cincin hologram berputar */}
                <group ref={ringRef} position={[0, 2.2, 0]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[1.5, 0.08, 12, 32]} />
                        <meshStandardMaterial color={practiceReady ? '#f59e0b' : '#94a3b8'} emissive={practiceReady ? '#d97706' : '#64748b'} emissiveIntensity={0.8} />
                    </mesh>
                </group>
            </group>

            {/* NPC Pemandu Latihan Soal di Samping Terminal */}
            <group position={[-2.4, 0, 0.5]}>
                <mesh position={[0, 0.9, 0]} castShadow>
                    <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
                    <meshStandardMaterial color="#f59e0b" roughness={0.4} />
                </mesh>
                <mesh position={[0, 1.8, 0]}>
                    <sphereGeometry args={[0.34, 16, 16]} />
                    <meshStandardMaterial color="#fde68a" />
                </mesh>
            </group>

            {/* Lampu Jalan & Dekorasi Arena */}
            <StreetLamp p={[-5, 0, 4]} r={0} />
            <StreetLamp p={[5, 0, 4]} r={0} />
            <Bench p={[-5, 0, -1]} r={Math.PI / 2} />
            <Bench p={[5, 0, -1]} r={-Math.PI / 2} />
        </group>
    );
}

/*
 * Distrik Ujian Resmi 3D (Sayap Timur)
 */
function ExamDistrict({ p = [34, 0, 10], examReady }) {
    const portalRef = useRef();
    useFrame((_, dt) => {
        if (portalRef.current) portalRef.current.rotation.z += dt * (examReady ? 0.7 : 0.2);
    });

    return (
        <group position={p}>
            {/* Plaza Ujian Resmi Marmer Putih / Hijau */}
            <Plaza p={[0, 0.02, 0]} size={[15, 15]} c={examReady ? '#dcfce7' : '#e2e8f0'} />
            <Plaza p={[0, 0.03, 0]} size={[12, 12]} c={examReady ? '#bbf7d0' : '#cbd5e1'} />

            {/* Jalan penghubung ke persimpangan tengah */}
            <Road p={[-15, 0, 0]} length={18} width={4} r={Math.PI / 2} c="#cbd5e1" />

            {/* Gapura Portal Megah Marmer Ujian */}
            <Box p={[-3.8, 3.2, 0]} s={[1.2, 6.4, 1.2]} c="#f8fafc" cast />
            <Box p={[3.8, 3.2, 0]} s={[1.2, 6.4, 1.2]} c="#f8fafc" cast />
            <Box p={[0, 6.6, 0]} s={[9.2, 1.2, 1.4]} c="#1e293b" cast />
            <SignBoard
                p={[0, 6.6, 0.75]}
                text="GERBANG ZONA UJIAN RESMI\nEvaluasi Belajar & Nilai Akhir"
                size={[8.2, 1.0]}
                bg="#064e3b"
                fg="#6ee7b7"
                font="bold 38px sans-serif"
                glow={examReady}
            />

            {/* Portal Gerbang Energi 3D */}
            <group ref={portalRef} position={[0, 2.8, 0]}>
                <mesh>
                    <torusGeometry args={[2.2, 0.16, 16, 36]} />
                    <meshStandardMaterial
                        color={examReady ? '#10b981' : '#64748b'}
                        emissive={examReady ? '#059669' : '#334155'}
                        emissiveIntensity={examReady ? 1.4 : 0.2}
                    />
                </mesh>
            </group>

            {/* Jika Terkunci: Gembok Raksasa 3D di Tengah Gerbang */}
            {!examReady && (
                <group position={[0, 2.7, 0]}>
                    <Box p={[0, 0, 0]} s={[1.2, 1.0, 0.4]} c="#dc2626" />
                    <mesh position={[0, 0.8, 0]}>
                        <torusGeometry args={[0.45, 0.1, 8, 16, Math.PI]} />
                        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
                    </mesh>
                </group>
            )}

            {/* Jika Terbuka: Efek Cakram Cahaya Portal Energi */}
            {examReady && (
                <mesh position={[0, 2.8, 0]}>
                    <circleGeometry args={[2.0, 32]} />
                    <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.6} transparent opacity={0.45} side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Lampu Pilar Kehormatan Ujian */}
            <StreetLamp p={[-5, 0, 4]} r={0} />
            <StreetLamp p={[5, 0, 4]} r={0} />
            <Bench p={[-5, 0, -2]} r={Math.PI / 2} />
            <Bench p={[5, 0, -2]} r={-Math.PI / 2} />
        </group>
    );
}

/*
 * Pilar Cahaya Navigasi (Wayfinding Light Beam)
 */
function WayfindingBeacon({ p = [0, 0, 0], color = '#38bdf8', label = 'TUJUAN ANDA' }) {
    const markerRef = useRef();
    useFrame((state, dt) => {
        if (markerRef.current) {
            markerRef.current.rotation.y += dt * 1.5;
            markerRef.current.position.y = 5.0 + Math.sin(state.clock.elapsedTime * 3) * 0.35;
        }
    });

    return (
        <group position={p}>
            {/* Pilar Cahaya Vertikal Menjulang Tinggi ke Angkasa */}
            <mesh position={[0, 16, 0]}>
                <cylinderGeometry args={[0.7, 1.4, 32, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>

            {/* Diamond Marker 3D Melayang Berputar */}
            <group ref={markerRef} position={[0, 5.0, 0]}>
                <mesh>
                    <octahedronGeometry args={[0.7, 0]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
                </mesh>
                <Html position={[0, 1.2, 0]} center distanceFactor={14}>
                    <div className="px-2.5 py-1 rounded-xl bg-slate-950/95 border border-cyan-400 text-cyan-300 font-extrabold text-[11px] shadow-2xl whitespace-nowrap animate-pulse flex items-center gap-1.5 pointer-events-none">
                        <span>🎯</span>
                        <span>{label}</span>
                    </div>
                </Html>
            </group>
        </group>
    );
}

export default function ZoneScene({
    zone,
    npcs = [],
    interactables = [],
    avatarConfig,
    keysRef,
    onNearbyTargetChange,
    onPlayerMove,
    practiceReady,
    examReady,
    currentObjective,
}) {
    const playerRef = useRef();
    const joystickVector = useGameStore((s) => s.joystickVector);
    const setFps = useGameStore((s) => s.setFps);
    const frameCount = useRef(0);
    const elapsedAcc = useRef(0);
    const targetVec = useMemo(() => new THREE.Vector3(), []);
    const camPos = useMemo(() => new THREE.Vector3(), []);

    const [playerPos, setPlayerPos] = useState({ x: 0, z: 12 });

    const theme = zone?.config?.theme || {
        sky: '#bae6fd',
        ground: '#86efac',
        accent: '#0284c7',
    };

    // Daftar Target Spasial Terstruktur dan Renggang
    const allTargets = useMemo(() => {
        const list = [];
        npcs.forEach((npc, idx) => {
            const fallbackPos = idx === 0 ? [-15, 0, -10] : idx === 1 ? [-3, 0, -22] : [15, 0, -10];
            const pos = Array.isArray(npc.position) && npc.position.length >= 3 ? npc.position : fallbackPos;
            list.push({
                kind: 'npc',
                id: `npc-${npc.id}`,
                title: npc.name,
                subtitle: npc.role_label,
                position: pos,
                color: npc.appearance?.shirtColor || '#0284c7',
                payload: npc,
            });
        });

        interactables.forEach((item, idx) => {
            const fallbackPos = idx === 0 ? [-18, 0, -10] : idx === 1 ? [0, 0, -22] : [18, 0, -10];
            const pos = Array.isArray(item.position) && item.position.length >= 3 ? item.position : fallbackPos;
            list.push({
                kind: 'interactable',
                id: `obj-${item.id}`,
                title: item.label,
                subtitle: 'Papan Materi Pembelajaran',
                position: pos,
                color: '#10b981',
                payload: item,
            });
        });

        // Portal Latihan Soal di Sayap Barat (-34, 0, 10)
        list.push({
            kind: 'portal_practice',
            id: 'portal-practice',
            title: 'Terminal Latihan Soal',
            subtitle: practiceReady ? 'Siap Dikerjakan (Syarat KKM 75)' : 'Selesaikan Seluruh Materi Dulu',
            position: [-34, 0, 10],
            color: practiceReady ? '#f59e0b' : '#64748b',
        });

        // Portal Zona Ujian Resmi di Sayap Timur (34, 0, 10)
        list.push({
            kind: 'portal_exam',
            id: 'portal-exam',
            title: 'Gerbang Zona Ujian Resmi',
            subtitle: examReady ? 'Terbuka! Klik untuk Mulai Ujian' : 'Terkunci (Syarat Latihan ≥ 75)',
            position: [34, 0, 10],
            color: examReady ? '#10b981' : '#64748b',
        });

        return list;
    }, [npcs, interactables, practiceReady, examReady]);

    useFrame((state, delta) => {
        frameCount.current += 1;
        elapsedAcc.current += delta;
        if (elapsedAcc.current >= 0.5) {
            setFps(Math.min(120, Math.round(frameCount.current / elapsedAcc.current)));
            frameCount.current = 0;
            elapsedAcc.current = 0;
        }

        if (!playerRef.current) return;

        const keys = keysRef.current || {};
        let moveX = joystickVector.x;
        let moveZ = joystickVector.z;

        if (keys.KeyW || keys.ArrowUp) moveZ -= 1;
        if (keys.KeyS || keys.ArrowDown) moveZ += 1;
        if (keys.KeyA || keys.ArrowLeft) moveX -= 1;
        if (keys.KeyD || keys.ArrowRight) moveX += 1;

        const len = Math.hypot(moveX, moveZ);
        if (len > 1) {
            moveX /= len;
            moveZ /= len;
        }

        const speed = 8.5;
        playerRef.current.position.x = THREE.MathUtils.clamp(
            playerRef.current.position.x + moveX * speed * delta,
            -46,
            46
        );
        playerRef.current.position.z = THREE.MathUtils.clamp(
            playerRef.current.position.z + moveZ * speed * delta,
            -38,
            26
        );

        if (len > 0.05) {
            const targetAngle = Math.atan2(moveX, moveZ);
            playerRef.current.rotation.y = THREE.MathUtils.lerp(
                playerRef.current.rotation.y,
                targetAngle,
                0.2
            );
        }

        const currX = playerRef.current.position.x;
        const currZ = playerRef.current.position.z;

        // Beritahu parent koordinat pemain setiap beberapa frame
        if (frameCount.current % 3 === 0) {
            setPlayerPos({ x: currX, z: currZ });
            if (onPlayerMove) onPlayerMove({ x: currX, z: currZ });
        }

        // Cek jarak terdekat dengan NPC / Objek / Portal
        let closest = null;
        let minDist = 3.6;
        for (const t of allTargets) {
            const d = Math.hypot(currX - t.position[0], currZ - t.position[2]);
            if (d <= minDist) {
                minDist = d;
                closest = t;
            }
        }
        onNearbyTargetChange(closest);

        targetVec.set(currX, playerRef.current.position.y + 1.4, currZ);
        camPos.set(currX, playerRef.current.position.y + 7.5, currZ + 12.0);
        state.camera.position.lerp(camPos, 0.12);
        state.camera.lookAt(targetVec);
    });

    return (
        <>
            <color attach="background" args={[theme.sky || '#bae6fd']} />
            <fog attach="fog" args={[theme.sky || '#bae6fd', 35, 110]} />
            <ambientLight intensity={0.9} />
            <directionalLight position={[24, 36, 16]} intensity={1.25} castShadow />

            {/* Lantai Utama Dunia 3D Lebih Luas (140x140) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[140, 140]} />
                <meshStandardMaterial color={theme.ground || '#86efac'} roughness={0.9} />
            </mesh>

            {/* Struktur Landmark Peta Sesuai BAB (Cilegon, Serang, Tangsel, Lebak, Pandeglang, Ciruas) */}
            <MapStructures mapKey={zone?.map_key || 'cilegon'} />

            {/* Rambu Penunjuk Jalan 3D di Persimpangan Tengah */}
            <DirectionalSignpost p={[0, 0, 6]} />

            {/* Distrik Latihan Soal di Sayap Barat */}
            <PracticeDistrict p={[-34, 0, 10]} practiceReady={practiceReady} />

            {/* Distrik Gerbang Ujian Resmi di Sayap Timur */}
            <ExamDistrict p={[34, 0, 10]} examReady={examReady} />

            {/* Pilar Cahaya Navigasi (Wayfinding Light Beam) di Atas Target Aktif */}
            {currentObjective && currentObjective.targetPos && (
                <WayfindingBeacon
                    p={currentObjective.targetPos}
                    color={currentObjective.color || '#38bdf8'}
                    label={currentObjective.title || 'TUJUAN BERIKUTNYA'}
                />
            )}

            {/* Render NPC & Papan Objek Interaktif */}
            {allTargets.map((t) => {
                // Jangan render ulang portal karena sudah dirender oleh District masing-masing
                if (t.kind === 'portal_practice' || t.kind === 'portal_exam') return null;

                const dist = Math.hypot(playerPos.x - t.position[0], playerPos.z - t.position[2]);
                const isTargetObjective = currentObjective?.id === t.id || currentObjective?.targetPos?.[0] === t.position[0];
                // Sembunyikan label jika terlalu jauh (>24m) kecuali bila objek tersebut tujuan aktif
                const showLabel = dist <= 22 || isTargetObjective;

                return (
                    <group key={t.id} position={t.position}>
                        {t.kind === 'npc' ? (
                            <>
                                <mesh position={[0, 0.9, 0]} castShadow>
                                    <capsuleGeometry args={[0.42, 0.85, 8, 16]} />
                                    <meshStandardMaterial color={t.color} roughness={0.4} />
                                </mesh>
                                <mesh position={[0, 1.85, 0]}>
                                    <sphereGeometry args={[0.36, 16, 16]} />
                                    <meshStandardMaterial color="#fde68a" />
                                </mesh>
                                <mesh position={[0, 2.55, 0]}>
                                    <octahedronGeometry args={[0.2, 0]} />
                                    <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.7} />
                                </mesh>
                            </>
                        ) : (
                            <group>
                                {/* Dudukan kaki papan materi kayu */}
                                <Cyl p={[-0.8, 0.7, 0]} a={[0.07, 0.08, 1.4, 8]} c="#78350f" />
                                <Cyl p={[0.8, 0.7, 0]} a={[0.07, 0.08, 1.4, 8]} c="#78350f" />
                                {/* Papan materi interaktif */}
                                <mesh position={[0, 1.7, 0]} castShadow>
                                    <boxGeometry args={[2.2, 1.5, 0.2]} />
                                    <meshStandardMaterial color="#0f172a" />
                                </mesh>
                                <mesh position={[0, 1.7, 0.12]}>
                                    <planeGeometry args={[2.0, 1.3]} />
                                    <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.4} />
                                </mesh>
                            </group>
                        )}

                        {showLabel && (
                            <Html position={[0, 3.1, 0]} center distanceFactor={16}>
                                <div className={`px-2.5 py-1 rounded-xl text-center whitespace-nowrap shadow-xl pointer-events-none transition-all ${
                                    isTargetObjective
                                        ? 'bg-slate-950 border-2 border-cyan-400 ring-2 ring-cyan-400/50'
                                        : 'bg-slate-950/90 border border-slate-700'
                                }`}>
                                    <p className="text-[11px] font-extrabold text-cyan-300 flex items-center justify-center gap-1">
                                        {isTargetObjective && <span>🎯</span>}
                                        <span>{t.title}</span>
                                    </p>
                                    <p className="text-[9px] text-slate-300">
                                        {t.subtitle} · <span className="text-amber-300 font-bold">{Math.round(dist)}m</span>
                                    </p>
                                </div>
                            </Html>
                        )}
                    </group>
                );
            })}

            {/* Karakter Siswa (Pemain) */}
            <group ref={playerRef} position={[0, 0, 12]}>
                <mesh position={[0, 0.9, 0]} castShadow>
                    <capsuleGeometry args={[0.42, 0.85, 8, 16]} />
                    <meshStandardMaterial color={avatarConfig?.shirtColor || '#06b6d4'} roughness={0.35} />
                </mesh>
                <mesh position={[0, 1.85, 0]} castShadow>
                    <sphereGeometry args={[0.36, 16, 16]} />
                    <meshStandardMaterial color={avatarConfig?.skinColor || '#fde68a'} roughness={0.4} />
                </mesh>
                <mesh position={[0, 1.0, -0.35]}>
                    <boxGeometry args={[0.5, 0.65, 0.25]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
            </group>
        </>
    );
}
