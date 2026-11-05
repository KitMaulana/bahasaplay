import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ArrowLeft, Gauge, Hand } from 'lucide-react';
import Joystick from '../game/hud/Joystick';
import { useGameStore } from '../stores/gameStore';

function generateBuildings() {
    const palette = ['#38bdf8', '#f97316', '#818cf8', '#34d399', '#facc15', '#fb7185'];
    const items = [];
    for (let i = 0; i < 30; i += 1) {
        const ring = i < 14 ? 14 : 26;
        const angle = (i / (i < 14 ? 14 : 16)) * Math.PI * 2;
        const x = Math.cos(angle) * ring + ((i % 3) - 1) * 1.8;
        const z = Math.sin(angle) * ring + ((i % 2) - 0.5) * 1.8;
        const height = 2.5 + (i % 5) * 1.4;
        const width = 2.4 + (i % 3) * 0.8;
        const depth = 2.4 + ((i + 1) % 3) * 0.8;
        items.push({
            id: i,
            position: [x, height / 2, z],
            size: [width, height, depth],
            color: palette[i % palette.length],
        });
    }
    return items;
}

function PlayerRig({ keysRef, onNearNpcChange }) {
    const playerRef = useRef();
    const joystickVector = useGameStore((s) => s.joystickVector);
    const setFps = useGameStore((s) => s.setFps);
    const frameCount = useRef(0);
    const elapsedAcc = useRef(0);
    const targetVec = useMemo(() => new THREE.Vector3(), []);
    const camPos = useMemo(() => new THREE.Vector3(), []);

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
            -34,
            34
        );
        playerRef.current.position.z = THREE.MathUtils.clamp(
            playerRef.current.position.z + moveZ * speed * delta,
            -34,
            34
        );

        if (len > 0.05) {
            const targetAngle = Math.atan2(moveX, moveZ);
            playerRef.current.rotation.y = THREE.MathUtils.lerp(
                playerRef.current.rotation.y,
                targetAngle,
                0.2
            );
        }

        const distToNpc = Math.hypot(
            playerRef.current.position.x - 0,
            playerRef.current.position.z - -4
        );
        onNearNpcChange(distToNpc <= 3.0);

        targetVec.set(
            playerRef.current.position.x,
            playerRef.current.position.y + 1.4,
            playerRef.current.position.z
        );
        camPos.set(
            playerRef.current.position.x,
            playerRef.current.position.y + 6.5,
            playerRef.current.position.z + 10.5
        );
        state.camera.position.lerp(camPos, 0.12);
        state.camera.lookAt(targetVec);
    });

    return (
        <group ref={playerRef} position={[0, 0, 4]}>
            <mesh position={[0, 0.9, 0]} castShadow>
                <capsuleGeometry args={[0.42, 0.85, 8, 16]} />
                <meshStandardMaterial color="#06b6d4" roughness={0.35} />
            </mesh>
            <mesh position={[0, 1.85, 0]} castShadow>
                <sphereGeometry args={[0.36, 16, 16]} />
                <meshStandardMaterial color="#fde68a" roughness={0.4} />
            </mesh>
            <mesh position={[0, 1.0, -0.35]}>
                <boxGeometry args={[0.5, 0.65, 0.25]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
        </group>
    );
}

export default function Lab3DPage() {
    const fps = useGameStore((s) => s.fps);
    const keysRef = useRef({});
    const [nearNpc, setNearNpc] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const buildings = useMemo(() => generateBuildings(), []);

    useEffect(() => {
        const onKeyDown = (e) => {
            keysRef.current[e.code] = true;
            if (e.code === 'KeyE' && nearNpc) {
                setDialogOpen((prev) => !prev);
            }
        };
        const onKeyUp = (e) => {
            keysRef.current[e.code] = false;
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [nearNpc]);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
            <Canvas shadows camera={{ position: [0, 7, 14], fov: 50 }} dpr={[1, 1.5]}>
                <color attach="background" args={['#bae6fd']} />
                <fog attach="fog" args={['#bae6fd', 28, 75]} />
                <ambientLight intensity={0.75} />
                <directionalLight position={[18, 28, 12]} intensity={1.15} castShadow />

                {/* Lantai Utama */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[90, 90]} />
                    <meshStandardMaterial color="#86efac" roughness={0.9} />
                </mesh>

                {/* Alun-Alun Tengah */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                    <circleGeometry args={[9, 32]} />
                    <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
                </mesh>

                {/* NPC Pemandu */}
                <group position={[0, 0, -4]}>
                    <mesh position={[0, 0.9, 0]} castShadow>
                        <capsuleGeometry args={[0.42, 0.85, 8, 16]} />
                        <meshStandardMaterial color="#f59e0b" roughness={0.4} />
                    </mesh>
                    <mesh position={[0, 1.85, 0]}>
                        <sphereGeometry args={[0.36, 16, 16]} />
                        <meshStandardMaterial color="#fed7aa" />
                    </mesh>
                    <mesh position={[0, 2.55, 0]}>
                        <octahedronGeometry args={[0.22, 0]} />
                        <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.6} />
                    </mesh>
                </group>

                {/* 30 Gedung Low-Poly */}
                {buildings.map((b) => (
                    <mesh key={b.id} position={b.position} castShadow receiveShadow>
                        <boxGeometry args={b.size} />
                        <meshStandardMaterial color={b.color} roughness={0.6} />
                    </mesh>
                ))}

                <PlayerRig keysRef={keysRef} onNearNpcChange={setNearNpc} />
            </Canvas>

            {/* Top HUD */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <Link
                    to="/"
                    className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/85 border border-slate-700 text-slate-100 text-xs sm:text-sm font-bold shadow-lg backdrop-blur"
                >
                    <ArrowLeft className="w-4 h-4 text-cyan-400" />
                    <span>Kembali</span>
                </Link>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/85 border border-slate-700 text-xs font-bold text-slate-200 shadow-lg backdrop-blur">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <span>{fps} FPS · 30 Gedung · Low-Poly</span>
                </div>
            </div>

            {/* Dialog NPC */}
            {dialogOpen && (
                <div className="absolute inset-x-4 bottom-36 sm:bottom-10 max-w-xl mx-auto p-5 rounded-2xl bg-slate-900/95 border-2 border-cyan-400/60 text-slate-100 shadow-2xl backdrop-blur">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
                            Pemandu BAHASA PLAY
                        </span>
                        <button
                            type="button"
                            onClick={() => setDialogOpen(false)}
                            className="text-xs text-slate-400 hover:text-white font-semibold"
                        >
                            Tutup [ESC]
                        </button>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                        Selamat datang di Lab Uji Performa 3D BAHASA PLAY! Lingkungan ini memuat 30 gedung
                        low-poly, karakter kapsul, kamera third-person, serta kontrol keyboard (WASD) dan
                        joystick sentuh.
                    </p>
                </div>
            )}

            {/* Kontrol Mobile & Tombol Interaksi */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between pointer-events-none">
                <div className="pointer-events-auto">
                    <Joystick />
                </div>

                <div className="flex flex-col items-end gap-2 pointer-events-auto">
                    <div className="hidden sm:block px-3 py-1.5 rounded-xl bg-slate-900/75 border border-slate-800 text-[11px] text-slate-300">
                        Gunakan <b>WASD / Panah</b> untuk bergerak · <b>E</b> untuk bicara
                    </div>
                    <button
                        type="button"
                        disabled={!nearNpc}
                        onClick={() => setDialogOpen((prev) => !prev)}
                        className={`min-w-[128px] min-h-[52px] px-5 py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-xl ${
                            nearNpc
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 animate-bounce'
                                : 'bg-slate-900/70 border border-slate-700 text-slate-500'
                        }`}
                    >
                        <Hand className="w-5 h-5" />
                        <span>{nearNpc ? 'Bicara [E]' : 'Dekati NPC'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
