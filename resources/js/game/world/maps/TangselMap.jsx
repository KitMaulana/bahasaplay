import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cyl, Sphere, Building, SignBoard, StreetLamp, Road, Plaza, Tree, Bench, Cloud, Bush } from '../Primitives';

/*
 * BAB 3 — Kota Tangerang Selatan: Gading Serpong (kota digital) & Alun-Alun Tangsel.
 * Menara kaca berjendela menyala, monumen hologram AI berputar, drone melayang,
 * pusat data dengan lampu server berkedip, jalur neon, dan taman kota.
 */

function AiHologram({ p }) {
    const core = useRef();
    const ring1 = useRef();
    const ring2 = useRef();
    useFrame((state, dt) => {
        const t = state.clock.elapsedTime;
        if (core.current) {
            core.current.rotation.y += dt * 0.8;
            core.current.position.y = 6 + Math.sin(t * 1.5) * 0.35;
        }
        if (ring1.current) ring1.current.rotation.z += dt * 0.6;
        if (ring2.current) ring2.current.rotation.x += dt * 0.45;
    });
    return (
        <group position={p}>
            <Cyl p={[0, 0.6, 0]} a={[3.6, 4, 1.2, 8]} c="#1e293b" metal={0.6} rough={0.3} />
            <Cyl p={[0, 1.25, 0]} a={[3.2, 3.2, 0.1, 32]} c="#22d3ee" emissive="#06b6d4" ei={1.2} />
            <Cyl p={[0, 3, 0]} a={[0.2, 1.4, 3.6, 8]} c="#334155" metal={0.7} />
            <group ref={core} position={[0, 6, 0]}>
                <mesh>
                    <icosahedronGeometry args={[1.8, 1]} />
                    <meshStandardMaterial color="#67e8f9" emissive="#0891b2" emissiveIntensity={0.9} wireframe />
                </mesh>
                <mesh>
                    <icosahedronGeometry args={[1.1, 0]} />
                    <meshStandardMaterial color="#a5f3fc" emissive="#22d3ee" emissiveIntensity={1.1} transparent opacity={0.85} flatShading />
                </mesh>
                <group ref={ring1}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[2.6, 0.06, 6, 40]} />
                        <meshStandardMaterial color="#f0abfc" emissive="#d946ef" emissiveIntensity={1.2} />
                    </mesh>
                </group>
                <group ref={ring2}>
                    <mesh>
                        <torusGeometry args={[3, 0.05, 6, 40]} />
                        <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={1.2} />
                    </mesh>
                </group>
            </group>
        </group>
    );
}

function Drone({ p, radius = 6, speed = 0.5, phase = 0 }) {
    const ref = useRef();
    const rotors = useRef();
    useFrame((state, dt) => {
        const t = state.clock.elapsedTime * speed + phase;
        if (ref.current) {
            ref.current.position.set(p[0] + Math.cos(t) * radius, p[1] + Math.sin(t * 2) * 0.6, p[2] + Math.sin(t) * radius);
            ref.current.rotation.y = -t;
        }
        if (rotors.current) rotors.current.rotation.y += dt * 30;
    });
    return (
        <group ref={ref}>
            <Box s={[0.8, 0.2, 0.8]} c="#0f172a" metal={0.5} />
            <Box p={[0, -0.12, 0]} s={[0.3, 0.1, 0.3]} c="#ef4444" emissive="#ef4444" ei={1.5} />
            <group ref={rotors}>
                {[[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]].map(([x, z], i) => (
                    <Box key={i} p={[x, 0.15, z]} s={[0.7, 0.02, 0.08]} c="#94a3b8" />
                ))}
            </group>
        </group>
    );
}

function DataCenter({ p }) {
    const leds = useRef();
    useFrame((state) => {
        if (!leds.current) return;
        const t = Math.floor(state.clock.elapsedTime * 4);
        leds.current.children.forEach((m, i) => {
            m.material.emissiveIntensity = (i * 7 + t) % 5 === 0 ? 0.2 : 1.4;
        });
    });
    return (
        <group position={p}>
            <Box p={[0, 3, 0]} s={[12, 6, 7]} c="#1e293b" metal={0.4} rough={0.4} cast />
            <Box p={[0, 6.2, 0]} s={[12.4, 0.4, 7.4]} c="#0f172a" />
            <group ref={leds}>
                {Array.from({ length: 24 }).map((_, i) => (
                    <mesh key={i} position={[-5 + (i % 12) * 0.9, 2 + Math.floor(i / 12) * 2, 3.52]}>
                        <boxGeometry args={[0.5, 0.18, 0.04]} />
                        <meshStandardMaterial color={i % 3 ? '#4ade80' : '#22d3ee'} emissive={i % 3 ? '#22c55e' : '#06b6d4'} emissiveIntensity={1} />
                    </mesh>
                ))}
            </group>
            <SignBoard p={[0, 5, 3.6]} text="PUSAT DATA & LAB AI" size={[7, 0.9]} bg="#0f172a" fg="#67e8f9" font="bold 56px sans-serif" glow />
            {[-4, 0, 4].map((x) => (
                <Cyl key={x} p={[x, 7, -1.5]} a={[0.9, 0.9, 1.2, 12]} c="#64748b" metal={0.6} />
            ))}
        </group>
    );
}

function NeonPath({ p, length = 20, r = 0, c = '#22d3ee' }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
                <planeGeometry args={[3, length]} />
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>
            {[-1.45, 1.45].map((x) => (
                <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.03, 0]}>
                    <planeGeometry args={[0.12, length]} />
                    <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.4} />
                </mesh>
            ))}
        </group>
    );
}

function SmartBench({ p, r = 0 }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Bench p={[0, 0, 0]} c="#e2e8f0" />
            <Box p={[1.05, 0.7, 0]} s={[0.4, 1.4, 0.4]} c="#0f172a" />
            <Box p={[1.05, 1.1, 0.21]} s={[0.3, 0.3, 0.02]} c="#22d3ee" emissive="#22d3ee" ei={1.2} />
            <Box p={[0, 1.6, 0]} s={[2.2, 0.06, 1]} c="#1e3a8a" metal={0.4} />
        </group>
    );
}

function LetterSign({ p, text = 'TANGSEL', c = '#f8fafc' }) {
    return <SignBoard p={p} text={text} size={[10, 1.6]} bg="#0f766e" fg={c} font="bold 90px sans-serif" />;
}

export default function TangselMap({ variant = 'gading_serpong' }) {
    const alun = variant === 'alun_tangsel';
    return (
        <group>
            {/* Plaza digital tengah */}
            <Plaza p={[0, 0.015, -1]} size={[12.5]} c={alun ? '#d1fae5' : '#cbd5e1'} circle />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -1]}>
                <ringGeometry args={[12.2, 12.6, 48]} />
                <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={1.2} />
            </mesh>
            <AiHologram p={[0, 0, -17]} />

            {/* Gedung kaca Gading Serpong */}
            <Building p={[-17, 0, -22]} size={[7, 24, 7]} c="#0c4a6e" lit="#7dd3fc" roof="#22d3ee" metal={0.6} />
            <Building p={[-8, 0, -30]} size={[6, 30, 6]} c="#1e1b4b" lit="#a5b4fc" roof="#818cf8" metal={0.6} />
            <Building p={[9, 0, -30]} size={[7, 27, 6]} c="#082f49" lit="#bae6fd" roof="#38bdf8" metal={0.6} />
            <Building p={[18, 0, -21]} size={[6, 20, 7]} c="#312e81" lit="#c7d2fe" roof="#6366f1" metal={0.6} />
            <Building p={[27, 0, -8]} size={[6, 14, 8]} c="#0f172a" lit="#fde68a" roof="#f59e0b" />
            <Building p={[-27, 0, -9]} size={[6, 16, 7]} c="#134e4a" lit="#99f6e4" roof="#14b8a6" />
            {/* Papan LED raksasa */}
            <SignBoard p={[18, 14, -17.4]} text={'AI UNTUK\nINDONESIA'} size={[5.5, 3]} bg="#1e1b4b" fg="#f0abfc" font="bold 80px sans-serif" glow />

            {alun ? (
                <group>
                    <LetterSign p={[-20, 1.5, 6]} text="ALUN-ALUN TANGSEL" />
                    <Box p={[-20, 0.4, 6]} s={[10.5, 0.8, 1]} c="#334155" />
                    {[[20, 2], [24, 9], [18, 13], [-24, 14], [-16, 15], [26, -2]].map(([x, z], i) => (
                        <Tree key={i} p={[x, 0, z]} scale={1.3} leaf={i % 2 ? '#16a34a' : '#22c55e'} />
                    ))}
                    <Plaza p={[21, 0.016, 7]} size={[12, 14]} c="#86efac" />
                </group>
            ) : (
                <DataCenter p={[-21, 0, 8]} />
            )}

            {/* Jalur neon & jalan raya */}
            <NeonPath p={[0, 0, -24]} length={14} />
            <NeonPath p={[-20, 0, -1]} length={14} r={Math.PI / 2} c="#e879f9" />
            <NeonPath p={[20, 0, -1]} length={14} r={Math.PI / 2} c="#e879f9" />
            <Road p={[0, 0, 17]} length={80} width={7} r={Math.PI / 2} color="#1f2937" />
            {[-24, -12, 12, 24].map((x) => (
                <StreetLamp key={x} p={[x, 0, 13]} r={-Math.PI / 2} c="#0f172a" />
            ))}

            <SmartBench p={[-7, 0, 11]} r={Math.PI} />
            <SmartBench p={[7, 0, 11]} r={Math.PI} />
            {!alun && [[22, 6], [26, 12], [-26, 16]].map(([x, z], i) => <Tree key={i} p={[x, 0, z]} scale={1.1} />)}
            {Array.from({ length: 10 }).map((_, i) => (
                <Bush key={i} p={[-13 + i * 2.9, 0, -12.8]} scale={0.7} c="#15803d" />
            ))}

            <Drone p={[0, 9, -14]} radius={7} speed={0.6} />
            <Drone p={[10, 12, -20]} radius={5} speed={0.8} phase={2} />
            <Drone p={[-12, 10, -10]} radius={4} speed={0.7} phase={4} />

            <Cloud p={[-20, 30, -50]} scale={2} />
            <Cloud p={[25, 34, -60]} scale={2.4} speed={0.25} />
            <Sphere p={[0, -0.5, -110]} a={[0.1, 4, 4]} c="#000000" />
        </group>
    );
}
