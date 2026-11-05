import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';

function MapStructures({ mapKey }) {
    if (mapKey === 'banten_lama' || mapKey === 'royal_baroe') {
        return (
            <group>
                {/* Menara Banten Lama */}
                <group position={[0, 0, -16]}>
                    <mesh position={[0, 5, 0]} castShadow>
                        <cylinderGeometry args={[1.4, 2.1, 10, 12]} />
                        <meshStandardMaterial color="#fef3c7" roughness={0.6} />
                    </mesh>
                    <mesh position={[0, 10.8, 0]}>
                        <coneGeometry args={[1.8, 2.5, 12]} />
                        <meshStandardMaterial color="#b45309" />
                    </mesh>
                </group>
                {/* Bangunan Masjid Beratap Tumpang */}
                <group position={[-13, 0, -12]}>
                    <mesh position={[0, 2.2, 0]} castShadow>
                        <boxGeometry args={[9, 4.4, 8]} />
                        <meshStandardMaterial color="#fffbeb" />
                    </mesh>
                    <mesh position={[0, 5.2, 0]}>
                        <coneGeometry args={[6.8, 2.4, 4]} />
                        <meshStandardMaterial color="#92400e" />
                    </mesh>
                    <mesh position={[0, 6.8, 0]}>
                        <coneGeometry args={[4.5, 2.0, 4]} />
                        <meshStandardMaterial color="#78350f" />
                    </mesh>
                </group>
                {/* Deretan Pertokoan Royal Baroe */}
                {[-12, -4, 4, 12].map((x, idx) => (
                    <group key={idx} position={[x, 0, 14]}>
                        <mesh position={[0, 2.2, 0]} castShadow>
                            <boxGeometry args={[5.5, 4.4, 5]} />
                            <meshStandardMaterial color={idx % 2 === 0 ? '#f59e0b' : '#0ea5e9'} />
                        </mesh>
                    </group>
                ))}
            </group>
        );
    }

    if (mapKey === 'gading_serpong' || mapKey === 'alun_tangsel') {
        return (
            <group>
                {/* Monumen Hologram AI */}
                <group position={[0, 0, -12]}>
                    <mesh position={[0, 1, 0]}>
                        <cylinderGeometry args={[2.5, 3, 2, 16]} />
                        <meshStandardMaterial color="#1e293b" />
                    </mesh>
                    <mesh position={[0, 3.8, 0]}>
                        <octahedronGeometry args={[1.8, 0]} />
                        <meshStandardMaterial
                            color="#38bdf8"
                            emissive="#0284c7"
                            emissiveIntensity={0.6}
                            wireframe
                        />
                    </mesh>
                </group>
                {/* Gedung Perkantoran Kaca Tinggi Gading Serpong */}
                {[
                    [-15, -14, 14, '#0284c7'],
                    [-7, -17, 18, '#6366f1'],
                    [8, -17, 16, '#0ea5e9'],
                    [16, -13, 13, '#4f46e5'],
                    [-16, 10, 11, '#38bdf8'],
                    [16, 10, 12, '#818cf8'],
                ].map(([x, z, h, color], idx) => (
                    <mesh key={idx} position={[x, h / 2, z]} castShadow receiveShadow>
                        <boxGeometry args={[5.5, h, 5.5]} />
                        <meshStandardMaterial color={color} metalness={0.35} roughness={0.25} />
                    </mesh>
                ))}
            </group>
        );
    }

    if (mapKey === 'baduy' || mapKey === 'alun_lebak') {
        return (
            <group>
                {/* Sungai Alami & Jembatan Bambu */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -13]}>
                    <planeGeometry args={[70, 4.5]} />
                    <meshStandardMaterial color="#38bdf8" roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.35, -13]}>
                    <boxGeometry args={[4.5, 0.35, 5.5]} />
                    <meshStandardMaterial color="#a16207" />
                </mesh>

                {/* Rumah Adat Panggung & Leuit (Lumbung Padi) yang Santun & Asri */}
                {[
                    [-12, -7],
                    [12, -7],
                    [-14, 5],
                    [14, 5],
                    [-8, -19],
                    [8, -19],
                ].map(([x, z], idx) => (
                    <group key={idx} position={[x, 0, z]}>
                        {/* Umpak & Bilik Bambu/Kayu */}
                        <mesh position={[0, 1.6, 0]} castShadow>
                            <boxGeometry args={[5, 2.4, 4.2]} />
                            <meshStandardMaterial color="#d6d3d1" roughness={0.85} />
                        </mesh>
                        {/* Atap Ijuk / Kirai */}
                        <mesh position={[0, 3.6, 0]} rotation={[0, Math.PI / 4, 0]}>
                            <coneGeometry args={[4.2, 2.2, 4]} />
                            <meshStandardMaterial color="#78350f" roughness={0.9} />
                        </mesh>
                    </group>
                ))}

                {/* Pepohonan Hutan Lindung */}
                {[-20, -16, -6, 6, 16, 20].map((x, idx) => (
                    <group key={idx} position={[x, 0, -23]}>
                        <mesh position={[0, 1.5, 0]}>
                            <cylinderGeometry args={[0.35, 0.5, 3, 8]} />
                            <meshStandardMaterial color="#713f12" />
                        </mesh>
                        <mesh position={[0, 4.2, 0]}>
                            <coneGeometry args={[2.4, 4.5, 8]} />
                            <meshStandardMaterial color="#15803d" />
                        </mesh>
                    </group>
                ))}
            </group>
        );
    }

    if (mapKey === 'smancir') {
        return (
            <group>
                {/* Lapangan Upacara & Tiang Bendera Merah Putih SMAN 1 Ciruas */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -2]}>
                    <planeGeometry args={[18, 14]} />
                    <meshStandardMaterial color="#94a3b8" />
                </mesh>
                <group position={[0, 0, -7]}>
                    <mesh position={[0, 4, 0]}>
                        <cylinderGeometry args={[0.08, 0.12, 8, 8]} />
                        <meshStandardMaterial color="#f8fafc" />
                    </mesh>
                    <mesh position={[0.9, 7.5, 0]}>
                        <boxGeometry args={[1.8, 0.55, 0.06]} />
                        <meshStandardMaterial color="#ef4444" />
                    </mesh>
                    <mesh position={[0.9, 6.95, 0]}>
                        <boxGeometry args={[1.8, 0.55, 0.06]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                </group>

                {/* Gedung Utama & Perpustakaan SMAN 1 Ciruas */}
                <group position={[0, 0, -16]}>
                    <mesh position={[0, 3, 0]} castShadow>
                        <boxGeometry args={[22, 6, 6]} />
                        <meshStandardMaterial color="#e0f2fe" />
                    </mesh>
                    <mesh position={[0, 6.8, 0]}>
                        <boxGeometry args={[23, 1.6, 7]} />
                        <meshStandardMaterial color="#1d4ed8" />
                    </mesh>
                </group>

                {/* Sayap Ruang Kelas Kiri & Kanan */}
                {[-15, 15].map((x, idx) => (
                    <group key={idx} position={[x, 0, -2]}>
                        <mesh position={[0, 2.5, 0]} castShadow>
                            <boxGeometry args={[5.5, 5, 18]} />
                            <meshStandardMaterial color="#f1f5f9" />
                        </mesh>
                        <mesh position={[0, 5.5, 0]}>
                            <boxGeometry args={[6.2, 1.2, 19]} />
                            <meshStandardMaterial color="#0284c7" />
                        </mesh>
                    </group>
                ))}
            </group>
        );
    }

    // Default: Kota Cilegon (Alun-Alun & Kawasan Industri Baja)
    return (
        <group>
            {/* Alun-Alun Kota Cilegon */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
                <circleGeometry args={[10, 32]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>
            {/* Kawasan Industri Baja Cilegon (Pabrik & Cerobong Low-Poly) */}
            <group position={[-15, 0, -14]}>
                <mesh position={[0, 3.5, 0]} castShadow>
                    <boxGeometry args={[10, 7, 7]} />
                    <meshStandardMaterial color="#475569" />
                </mesh>
                <mesh position={[-2.5, 9, -1]} castShadow>
                    <cylinderGeometry args={[0.7, 0.9, 6, 12]} />
                    <meshStandardMaterial color="#f97316" />
                </mesh>
                <mesh position={[2.5, 9, -1]} castShadow>
                    <cylinderGeometry args={[0.7, 0.9, 6, 12]} />
                    <meshStandardMaterial color="#f97316" />
                </mesh>
            </group>
            {/* Gedung HRD & Pusat Karier */}
            <group position={[14, 0, -14]}>
                <mesh position={[0, 4.5, 0]} castShadow>
                    <boxGeometry args={[8, 9, 6]} />
                    <meshStandardMaterial color="#0284c7" />
                </mesh>
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
    practiceReady,
    examReady,
}) {
    const playerRef = useRef();
    const joystickVector = useGameStore((s) => s.joystickVector);
    const setFps = useGameStore((s) => s.setFps);
    const frameCount = useRef(0);
    const elapsedAcc = useRef(0);
    const targetVec = useMemo(() => new THREE.Vector3(), []);
    const camPos = useMemo(() => new THREE.Vector3(), []);

    const theme = zone?.config?.theme || {
        sky: '#bae6fd',
        ground: '#86efac',
        accent: '#0284c7',
    };

    const allTargets = useMemo(() => {
        const list = [];
        npcs.forEach((npc) => {
            const pos = Array.isArray(npc.position) ? npc.position : [0, 0, -4];
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

        interactables.forEach((item) => {
            const pos = Array.isArray(item.position) ? item.position : [4, 0, -8];
            list.push({
                kind: 'interactable',
                id: `obj-${item.id}`,
                title: item.label,
                subtitle: 'Objek Pembelajaran Interaktif',
                position: pos,
                color: '#10b981',
                payload: item,
            });
        });

        // Portal Latihan Soal & Portal Zona Ujian langsung di dunia 3D
        list.push({
            kind: 'portal_practice',
            id: 'portal-practice',
            title: 'Terminal Latihan Soal (Practice)',
            subtitle: practiceReady ? 'Siap Dikerjakan (Maks. 10 Soal)' : 'Baca Semua Materi Dulu',
            position: [-9, 0, 5],
            color: practiceReady ? '#f59e0b' : '#64748b',
        });

        list.push({
            kind: 'portal_exam',
            id: 'portal-exam',
            title: 'Gerbang Zona Ujian Resmi',
            subtitle: examReady ? 'Terbuka! Klik untuk Mulai Ujian' : 'Terkunci (Syarat Latihan ≥ 75)',
            position: [9, 0, 5],
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

        const keys = keysRef.current;
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

        const speed = 7.5;
        playerRef.current.position.x = THREE.MathUtils.clamp(
            playerRef.current.position.x + moveX * speed * delta,
            -28,
            28
        );
        playerRef.current.position.z = THREE.MathUtils.clamp(
            playerRef.current.position.z + moveZ * speed * delta,
            -24,
            24
        );

        if (len > 0.05) {
            const targetAngle = Math.atan2(moveX, moveZ);
            playerRef.current.rotation.y = THREE.MathUtils.lerp(
                playerRef.current.rotation.y,
                targetAngle,
                0.2
            );
        }

        // Cek jarak terdekat dengan NPC / Objek / Portal
        let closest = null;
        let minDist = 3.2;
        for (const t of allTargets) {
            const d = Math.hypot(
                playerRef.current.position.x - t.position[0],
                playerRef.current.position.z - t.position[2]
            );
            if (d <= minDist) {
                minDist = d;
                closest = t;
            }
        }
        onNearbyTargetChange(closest);

        targetVec.set(
            playerRef.current.position.x,
            playerRef.current.position.y + 1.4,
            playerRef.current.position.z
        );
        camPos.set(
            playerRef.current.position.x,
            playerRef.current.position.y + 7.0,
            playerRef.current.position.z + 11.0
        );
        state.camera.position.lerp(camPos, 0.12);
        state.camera.lookAt(targetVec);
    });

    return (
        <>
            <color attach="background" args={[theme.sky || '#bae6fd']} />
            <fog attach="fog" args={[theme.sky || '#bae6fd', 26, 75]} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[16, 26, 12]} intensity={1.15} castShadow />

            {/* Lantai Zona */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[80, 80]} />
                <meshStandardMaterial color={theme.ground || '#86efac'} roughness={0.9} />
            </mesh>

            {/* Struktur Landmark Peta */}
            <MapStructures mapKey={zone?.map_key || 'cilegon'} />

            {/* Render NPC, Objek Interaktif, & Portal */}
            {allTargets.map((t) => (
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
                                <meshStandardMaterial
                                    color="#22d3ee"
                                    emissive="#06b6d4"
                                    emissiveIntensity={0.7}
                                />
                            </mesh>
                        </>
                    ) : t.kind === 'interactable' ? (
                        <group>
                            <mesh position={[0, 1.1, 0]} castShadow>
                                <boxGeometry args={[1.6, 1.4, 0.35]} />
                                <meshStandardMaterial color="#0f172a" />
                            </mesh>
                            <mesh position={[0, 1.1, 0.2]}>
                                <planeGeometry args={[1.4, 1.1]} />
                                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.35} />
                            </mesh>
                        </group>
                    ) : (
                        <group>
                            <mesh position={[0, 1.5, 0]}>
                                <torusGeometry args={[1.2, 0.16, 12, 24]} />
                                <meshStandardMaterial
                                    color={t.color}
                                    emissive={t.color}
                                    emissiveIntensity={0.5}
                                />
                            </mesh>
                        </group>
                    )}

                    <Html position={[0, 3.0, 0]} center distanceFactor={16}>
                        <div className="px-2.5 py-1 rounded-xl bg-slate-950/90 border border-slate-700 text-center whitespace-nowrap shadow-lg pointer-events-none">
                            <p className="text-[11px] font-extrabold text-cyan-300">{t.title}</p>
                            <p className="text-[9px] text-slate-300">{t.subtitle}</p>
                        </div>
                    </Html>
                </group>
            ))}

            {/* Karakter Pemain (Siswa) */}
            <group ref={playerRef} position={[0, 0, 8]}>
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
