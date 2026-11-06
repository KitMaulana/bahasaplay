import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { playerState } from '../lib/playerState';

/*
 * ElbiraCat — kucing oranye blok (gaya Roblox) yang mengikuti pemain di setiap peta.
 * Ia berperan sebagai asisten belajar AI: klik kucingnya atau papan namanya untuk membuka chat.
 * Model menghadap +Z (sama dengan karakter pemain).
 */

const ORANGE = '#f59e0b';
const STRIPE = '#c2410c';
const CREAM = '#fef3c7';
const SCALE = 1.75;
const FOLLOW_DIST = 2.2; // jarak di belakang pemain (diukur sepanjang jejak langkah)
const SIDE_OFFSET = 1.1; // geser ke kiri jalur
const SMOOTH_TIME = 0.22; // makin kecil makin cepat menyusul
const MAX_SPEED = 14;

/** Smooth damp kritis (pegas teredam) — gerak halus tanpa sentakan, seperti kamera game. */
function smoothDamp(current, target, velObj, key, smoothTime, maxSpeed, dt) {
    const omega = 2 / smoothTime;
    const x = omega * dt;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    let change = current - target;
    const maxChange = maxSpeed * smoothTime;
    change = Math.max(-maxChange, Math.min(maxChange, change));
    const tgt = current - change;
    const temp = (velObj[key] + omega * change) * dt;
    velObj[key] = (velObj[key] - omega * temp) * exp;
    let out = tgt + (change + temp) * exp;
    // Cegah melewati target
    if ((target - current > 0) === (out > target)) {
        out = target;
        velObj[key] = (out - target) / dt;
    }
    return out;
}

function B({ p, s, c, r }) {
    return (
        <mesh position={p} rotation={r} castShadow>
            <boxGeometry args={s} />
            <meshStandardMaterial color={c} roughness={0.75} />
        </mesh>
    );
}

export default function ElbiraCat({ onOpen, hidden = false, chatOpen = false }) {
    const root = useRef();
    const tail = useRef();
    const head = useRef();
    const legs = useRef([]);
    const walkT = useRef(0);
    const body = useRef();
    const vel = useRef({ x: 0, z: 0 });
    const speedRef = useRef(0);
    // Jejak langkah pemain; diawali satu titik di belakang posisi awal pemain
    const trailRef = useRef([{ x: playerState.x - 1.9, z: playerState.z + 0.4 }]);
    const [hover, setHover] = useState(false);
    const [greet, setGreet] = useState(true);

    // Gelembung sapaan di awal, lalu muncul lagi sesekali sebagai pengingat
    useEffect(() => {
        const off = setTimeout(() => setGreet(false), 9000);
        const again = setInterval(() => {
            setGreet(true);
            setTimeout(() => setGreet(false), 6000);
        }, 75000);
        return () => {
            clearTimeout(off);
            clearInterval(again);
        };
    }, []);

    useEffect(() => {
        document.body.style.cursor = hover ? 'pointer' : '';
        return () => {
            document.body.style.cursor = '';
        };
    }, [hover]);

    useFrame((state, delta) => {
        const g = root.current;
        if (!g) return;
        const dt = Math.min(delta, 0.12);
        const px = playerState.x;
        const pz = playerState.z;
        const trail = trailRef.current;

        // 1) Rekam jejak langkah pemain (titik baru tiap ±0,2 m)
        const last = trail[trail.length - 1];
        if (!last || Math.hypot(px - last.x, pz - last.z) > 0.2) {
            trail.push({ x: px, z: pz });
            if (trail.length > 160) trail.shift();
        }

        // 2) Titik tujuan = posisi di jejak sejauh FOLLOW_DIST di belakang pemain,
        //    digeser sedikit ke kiri jalur agar kucing tidak tertutup badan pemain dari kamera.
        let tx = trail[0].x;
        let tz = trail[0].z;
        let dirX = px - tx;
        let dirZ = pz - tz;
        let remain = FOLLOW_DIST;
        let ax = px;
        let az = pz;
        for (let i = trail.length - 1; i >= 0; i--) {
            const b = trail[i];
            const seg = Math.hypot(ax - b.x, az - b.z);
            if (seg >= remain) {
                const k = seg > 0 ? remain / seg : 0;
                tx = ax + (b.x - ax) * k;
                tz = az + (b.z - az) * k;
                dirX = ax - b.x;
                dirZ = az - b.z;
                remain = 0;
                break;
            }
            remain -= seg;
            ax = b.x;
            az = b.z;
        }
        const dl = Math.hypot(dirX, dirZ);
        if (dl > 0.001) {
            // vektor kiri dari arah jalan (dirX, dirZ) → (dirZ, -dirX)
            tx += (dirZ / dl) * SIDE_OFFSET;
            tz += (-dirX / dl) * SIDE_OFFSET;
        }

        // Buang jejak lama yang sudah dilewati kucing
        while (trail.length > 2 && Math.hypot(trail[0].x - px, trail[0].z - pz) > FOLLOW_DIST + 6) trail.shift();

        // 3) Gerak halus (smooth damp ala kamera game) + teleport bila tertinggal jauh
        const far = Math.hypot(tx - g.position.x, tz - g.position.z);
        if (far > 18) {
            g.position.set(tx, 0, tz);
            vel.current.x = 0;
            vel.current.z = 0;
        } else {
            // Dipecah menjadi langkah kecil agar tetap halus & tidak tertinggal di FPS rendah (HP)
            const steps = Math.max(1, Math.ceil(dt / 0.02));
            const h = dt / steps;
            for (let i = 0; i < steps; i++) {
                g.position.x = smoothDamp(g.position.x, tx, vel.current, 'x', SMOOTH_TIME, MAX_SPEED, h);
                g.position.z = smoothDamp(g.position.z, tz, vel.current, 'z', SMOOTH_TIME, MAX_SPEED, h);
            }
        }

        // 4) Arah hadap: ikuti arah jalan; saat diam, pelan-pelan menoleh ke pemain
        const speed = Math.hypot(vel.current.x, vel.current.z);
        speedRef.current = THREE.MathUtils.lerp(speedRef.current, speed, 1 - Math.exp(-dt * 10));
        let face;
        let turnRate;
        if (speed > 0.6) {
            face = Math.atan2(vel.current.x, vel.current.z);
            turnRate = 10;
        } else {
            face = Math.atan2(px - g.position.x, pz - g.position.z);
            turnRate = 2.5;
        }
        let d = face - g.rotation.y;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        g.rotation.y += d * (1 - Math.exp(-dt * turnRate));

        // 5) Animasi: langkah kaki sesuai kecepatan nyata, ekor, kepala, badan memantul
        const t = state.clock.elapsedTime;
        const sp = speedRef.current;
        const walk = Math.min(1, sp / 4);
        walkT.current += dt * (4 + sp * 1.6);
        legs.current.forEach((leg, i) => {
            if (!leg) return;
            const phase = i === 0 || i === 3 ? 0 : Math.PI;
            leg.rotation.x = Math.sin(walkT.current + phase) * 0.75 * walk;
        });
        const bob = Math.abs(Math.sin(walkT.current)) * 0.035 * walk;
        if (body.current) body.current.position.y = bob;
        if (tail.current) {
            tail.current.rotation.z = Math.sin(t * (3 + walk * 6)) * (0.45 - walk * 0.2);
            tail.current.rotation.x = -0.15 * walk;
            tail.current.position.y = 0.45 + bob;
        }
        if (head.current) {
            head.current.rotation.z = Math.sin(t * 1.3) * 0.08 * (1 - walk);
            head.current.position.y = 0.68 + bob + Math.sin(t * 2) * 0.01 * (1 - walk);
        }
    });

    const handleClick = (e) => {
        // Abaikan klik yang sebenarnya adalah geseran kamera
        if (e.delta > 6) return;
        e.stopPropagation();
        onOpen?.();
    };

    // Posisi awal dikunci sekali saja. Jika ikut berubah tiap render, R3F akan menyetel ulang
    // posisi kucing setiap kali ZoneScene render ulang (penyebab gerak tersendat).
    const startPos = useRef([trailRef.current[0].x, 0, trailRef.current[0].z]).current;

    return (
        <group ref={root} position={startPos} visible={!hidden}>
            <group
                scale={SCALE}
                onClick={handleClick}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHover(true);
                }}
                onPointerOut={() => setHover(false)}
            >
                <group ref={body}>
                {/* Badan */}
                <B p={[0, 0.38, 0]} s={[0.36, 0.3, 0.62]} c={ORANGE} />
                <B p={[0, 0.27, 0.02]} s={[0.3, 0.1, 0.5]} c={CREAM} />
                {[-0.14, 0.02, 0.18].map((z) => (
                    <B key={z} p={[0, 0.535, z]} s={[0.37, 0.02, 0.07]} c={STRIPE} />
                ))}

                </group>

                {/* Kaki (depan-kiri, depan-kanan, belakang-kiri, belakang-kanan) */}
                {[
                    [-0.11, 0.2],
                    [0.11, 0.2],
                    [-0.11, -0.2],
                    [0.11, -0.2],
                ].map(([x, z], i) => (
                    <group key={i} ref={(el) => (legs.current[i] = el)} position={[x, 0.26, z]}>
                        <B p={[0, -0.12, 0]} s={[0.11, 0.24, 0.11]} c={ORANGE} />
                        <B p={[0, -0.23, 0.01]} s={[0.12, 0.05, 0.13]} c={CREAM} />
                    </group>
                ))}

                {/* Ekor */}
                <group ref={tail} position={[0, 0.45, -0.3]}>
                    <B p={[0, 0.06, -0.08]} s={[0.08, 0.08, 0.2]} c={ORANGE} r={[0.6, 0, 0]} />
                    <B p={[0, 0.2, -0.15]} s={[0.08, 0.22, 0.08]} c={STRIPE} r={[0.25, 0, 0]} />
                    <B p={[0, 0.34, -0.17]} s={[0.085, 0.1, 0.085]} c={CREAM} />
                </group>

                {/* Kepala */}
                <group ref={head} position={[0, 0.68, 0.33]}>
                    <B p={[0, 0, 0]} s={[0.44, 0.36, 0.36]} c={ORANGE} />
                    {[-0.08, 0, 0.08].map((x) => (
                        <B key={x} p={[x, 0.17, 0.05]} s={[0.04, 0.03, 0.2]} c={STRIPE} />
                    ))}
                    {/* Telinga */}
                    {[-0.13, 0.13].map((x) => (
                        <group key={x} position={[x, 0.22, -0.02]} rotation={[0, 0, x > 0 ? -0.25 : 0.25]}>
                            <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
                                <coneGeometry args={[0.1, 0.17, 4]} />
                                <meshStandardMaterial color={STRIPE} roughness={0.8} />
                            </mesh>
                            <mesh position={[0, -0.01, 0.035]} rotation={[0, Math.PI / 4, 0]}>
                                <coneGeometry args={[0.05, 0.11, 4]} />
                                <meshStandardMaterial color="#fda4af" />
                            </mesh>
                        </group>
                    ))}
                    {/* Wajah */}
                    <B p={[0, -0.07, 0.17]} s={[0.24, 0.15, 0.06]} c={CREAM} />
                    {[-0.1, 0.1].map((x) => (
                        <group key={x} position={[x, 0.04, 0.185]}>
                            <B p={[0, 0, 0]} s={[0.07, 0.09, 0.02]} c="#0f172a" />
                            <B p={[0.015, 0.02, 0.012]} s={[0.025, 0.025, 0.01]} c="#ffffff" />
                        </group>
                    ))}
                    <B p={[0, -0.03, 0.205]} s={[0.06, 0.04, 0.02]} c="#f43f5e" />
                    <B p={[0, -0.09, 0.205]} s={[0.08, 0.015, 0.01]} c="#0f172a" />
                    {/* Kumis */}
                    {[-1, 1].map((side) =>
                        [-0.04, -0.08].map((y) => <B key={`${side}${y}`} p={[side * 0.2, y, 0.17]} s={[0.14, 0.008, 0.008]} c="#334155" r={[0, 0, side * (y === -0.04 ? 0.15 : -0.1)]} />)
                    )}
                    {/* Kalung toska + lonceng emas */}
                    <B p={[0, -0.2, 0.02]} s={[0.4, 0.05, 0.32]} c="#0f8b8d" />
                    <mesh position={[0, -0.26, 0.17]} castShadow>
                        <sphereGeometry args={[0.045, 10, 8]} />
                        <meshStandardMaterial color="#f2b43a" metalness={0.6} roughness={0.3} emissive="#b45309" emissiveIntensity={0.25} />
                    </mesh>
                </group>

                {/* Lingkaran sorot saat disentuh kursor */}
                {hover && (
                    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.42, 0.5, 32]} />
                        <meshBasicMaterial color="#f2b43a" transparent opacity={0.85} />
                    </mesh>
                )}
            </group>

            {/* Papan nama yang bisa diklik */}
            {!hidden && !chatOpen && (
                <Html position={[0, 2.25, 0]} center distanceFactor={10} zIndexRange={[16, 0]}>
                    <div className="flex flex-col items-center gap-1 select-none">
                        {greet && (
                            <button
                                type="button"
                                onClick={onOpen}
                                className="animate-bubble-in whitespace-nowrap px-2.5 py-1 rounded-xl rounded-bl-sm bg-white border-2 border-banten-night text-[11px] font-extrabold text-banten-night shadow-lg cursor-pointer"
                            >
                                Meong! Ada yang mau ditanyakan? 🐾
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onOpen}
                            className="pointer-events-auto whitespace-nowrap flex flex-col items-center px-3 py-1 rounded-xl bg-gradient-to-b from-amber-300 to-orange-500 border-2 border-banten-night shadow-lg cursor-pointer hover:brightness-110"
                            aria-label="Buka chat Elbira, asisten belajar AI chatbot"
                        >
                            <span className="flex items-center gap-1.5">
                                <span className="text-[11px]">🐱</span>
                                <span className="font-game text-xs text-banten-night tracking-wide">Elbira</span>
                                <span className="text-[9px] font-extrabold text-banten-night/80">· Tanya [C]</span>
                            </span>
                            <span className="text-[8px] font-extrabold uppercase tracking-wider text-banten-night/85 leading-tight">Asisten Belajar (AI Chatbot)</span>
                        </button>
                    </div>
                </Html>
            )}
        </group>
    );
}
