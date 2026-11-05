import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/*
 * Pustaka properti 3D low-poly prosedural untuk semua peta BAHASA PLAY.
 * Semua bentuk dibuat dari primitif Three.js + CanvasTexture (tanpa unduhan aset),
 * sehingga tetap ringan, bisa offline, dan aman untuk perangkat seluler.
 */

/* ---------- Helper mesh ringkas ---------- */

export function Box({ p = [0, 0, 0], s = [1, 1, 1], r, c = '#cbd5e1', cast = false, receive = false, metal = 0, rough = 0.8, emissive, ei = 0.6, map, opacity }) {
    return (
        <mesh position={p} rotation={r} castShadow={cast} receiveShadow={receive}>
            <boxGeometry args={s} />
            <meshStandardMaterial
                color={c}
                metalness={metal}
                roughness={rough}
                emissive={emissive || '#000000'}
                emissiveIntensity={emissive ? ei : 0}
                map={map || null}
                transparent={opacity !== undefined}
                opacity={opacity ?? 1}
            />
        </mesh>
    );
}

export function Cyl({ p = [0, 0, 0], a = [0.5, 0.5, 1, 12], r, c = '#cbd5e1', cast = false, metal = 0, rough = 0.7, emissive, ei = 0.6, flat = false }) {
    return (
        <mesh position={p} rotation={r} castShadow={cast}>
            <cylinderGeometry args={a} />
            <meshStandardMaterial color={c} metalness={metal} roughness={rough} emissive={emissive || '#000000'} emissiveIntensity={emissive ? ei : 0} flatShading={flat} />
        </mesh>
    );
}

export function Cone({ p = [0, 0, 0], a = [1, 1, 8], r, c = '#78350f', cast = false, flat = true, rough = 0.85 }) {
    return (
        <mesh position={p} rotation={r} castShadow={cast}>
            <coneGeometry args={a} />
            <meshStandardMaterial color={c} flatShading={flat} roughness={rough} />
        </mesh>
    );
}

export function Sphere({ p = [0, 0, 0], a = [1, 16, 12], s, c = '#e2e8f0', cast = false, metal = 0, rough = 0.6, emissive, ei = 0.6 }) {
    return (
        <mesh position={p} scale={s} castShadow={cast}>
            <sphereGeometry args={a} />
            <meshStandardMaterial color={c} metalness={metal} roughness={rough} emissive={emissive || '#000000'} emissiveIntensity={emissive ? ei : 0} />
        </mesh>
    );
}

/* ---------- Tekstur prosedural (di-cache) ---------- */

const textureCache = new Map();

export function useWindowTexture(base = '#0f172a', lit = '#bae6fd', cols = 4, rows = 8, litRatio = 0.75) {
    return useMemo(() => {
        const key = `win-${base}-${lit}-${cols}-${rows}-${litRatio}`;
        if (textureCache.has(key)) return textureCache.get(key);
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 128, 256);
        const cw = 128 / cols;
        const ch = 256 / rows;
        let seed = cols * 31 + rows * 17;
        for (let y = 0; y < rows; y += 1) {
            for (let x = 0; x < cols; x += 1) {
                seed = (seed * 9301 + 49297) % 233280;
                const on = seed / 233280 < litRatio;
                ctx.fillStyle = on ? lit : 'rgba(15,23,42,0.85)';
                ctx.fillRect(x * cw + cw * 0.18, y * ch + ch * 0.2, cw * 0.64, ch * 0.58);
            }
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        textureCache.set(key, tex);
        return tex;
    }, [base, lit, cols, rows, litRatio]);
}

function useTextTexture(text, bg, fg, w = 512, h = 128, font = 'bold 54px sans-serif') {
    return useMemo(() => {
        const key = `txt-${text}-${bg}-${fg}-${w}-${h}-${font}`;
        if (textureCache.has(key)) return textureCache.get(key);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 6;
        ctx.strokeRect(6, 6, w - 12, h - 12);
        ctx.fillStyle = fg;
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines = String(text).split('\n');
        const lh = h / (lines.length + 0.4);
        lines.forEach((line, i) => ctx.fillText(line, w / 2, lh * (i + 0.7), w - 24));
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        textureCache.set(key, tex);
        return tex;
    }, [text, bg, fg, w, h, font]);
}

/** Papan nama 3D dengan teks dari CanvasTexture (tidak butuh font eksternal). */
export function SignBoard({ p = [0, 0, 0], r = [0, 0, 0], text = 'PAPAN', size = [4, 1], bg = '#1e3a8a', fg = '#ffffff', font, glow = false }) {
    const ratio = size[0] / size[1];
    const tex = useTextTexture(text, bg, fg, 512, Math.max(64, Math.round(512 / ratio)), font);
    return (
        <group position={p} rotation={r}>
            <mesh>
                <boxGeometry args={[size[0] + 0.15, size[1] + 0.15, 0.12]} />
                <meshStandardMaterial color="#1f2937" />
            </mesh>
            <mesh position={[0, 0, 0.065]}>
                <planeGeometry args={size} />
                <meshStandardMaterial map={tex} emissive={glow ? '#ffffff' : '#000000'} emissiveMap={glow ? tex : null} emissiveIntensity={glow ? 0.55 : 0} />
            </mesh>
        </group>
    );
}

/* ---------- Vegetasi ---------- */

export function Tree({ p = [0, 0, 0], scale = 1, leaf = '#22c55e', trunk = '#7c4a1e' }) {
    return (
        <group position={p} scale={scale}>
            <Cyl p={[0, 1, 0]} a={[0.18, 0.28, 2, 6]} c={trunk} flat />
            <mesh position={[0, 2.6, 0]} castShadow>
                <icosahedronGeometry args={[1.3, 0]} />
                <meshStandardMaterial color={leaf} flatShading roughness={0.9} />
            </mesh>
            <mesh position={[0.5, 3.3, 0.2]}>
                <icosahedronGeometry args={[0.85, 0]} />
                <meshStandardMaterial color={leaf} flatShading roughness={0.9} />
            </mesh>
        </group>
    );
}

export function PineTree({ p = [0, 0, 0], scale = 1, leaf = '#15803d' }) {
    return (
        <group position={p} scale={scale}>
            <Cyl p={[0, 0.8, 0]} a={[0.15, 0.25, 1.6, 6]} c="#713f12" flat />
            <Cone p={[0, 2.2, 0]} a={[1.5, 2.2, 7]} c={leaf} cast />
            <Cone p={[0, 3.4, 0]} a={[1.15, 1.9, 7]} c={leaf} />
            <Cone p={[0, 4.4, 0]} a={[0.75, 1.5, 7]} c={leaf} />
        </group>
    );
}

export function PalmTree({ p = [0, 0, 0], scale = 1 }) {
    return (
        <group position={p} scale={scale}>
            <Cyl p={[0, 2, 0]} a={[0.14, 0.22, 4, 6]} c="#a16207" flat />
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh key={i} position={[0, 4, 0]} rotation={[0.9, (i * Math.PI) / 3, 0]}>
                    <boxGeometry args={[0.35, 0.05, 2.2]} />
                    <meshStandardMaterial color="#16a34a" flatShading />
                </mesh>
            ))}
        </group>
    );
}

export function Bush({ p = [0, 0, 0], scale = 1, c = '#16a34a' }) {
    return (
        <mesh position={[p[0], p[1] + 0.4 * scale, p[2]]} scale={scale}>
            <icosahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial color={c} flatShading />
        </mesh>
    );
}

export function Rock({ p = [0, 0, 0], scale = 1, c = '#78716c' }) {
    return (
        <mesh position={p} scale={scale} rotation={[0.3, scale * 2, 0.1]} castShadow>
            <dodecahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial color={c} flatShading roughness={1} />
        </mesh>
    );
}

/* ---------- Infrastruktur kota ---------- */

export function StreetLamp({ p = [0, 0, 0], r = 0, c = '#334155' }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Cyl p={[0, 2, 0]} a={[0.06, 0.1, 4, 6]} c={c} metal={0.5} />
            <Box p={[0.4, 3.95, 0]} s={[0.9, 0.08, 0.08]} c={c} />
            <Box p={[0.8, 3.85, 0]} s={[0.35, 0.12, 0.25]} c="#fef9c3" emissive="#fde047" ei={0.9} />
        </group>
    );
}

/** Jalan aspal dengan marka putus-putus. */
export function Road({ p = [0, 0, 0], length = 40, width = 5, r = 0, color = '#374151', dashes = true }) {
    const count = Math.floor(length / 3);
    return (
        <group position={p} rotation={[0, r, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                <planeGeometry args={[width, length]} />
                <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
            {dashes &&
                Array.from({ length: count }).map((_, i) => (
                    <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -length / 2 + 1.5 + i * 3]}>
                        <planeGeometry args={[0.18, 1.4]} />
                        <meshBasicMaterial color="#f8fafc" />
                    </mesh>
                ))}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2 + 0.25, 0.025, 0]}>
                <planeGeometry args={[0.5, length]} />
                <meshStandardMaterial color="#9ca3af" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-width / 2 - 0.25, 0.025, 0]}>
                <planeGeometry args={[0.5, length]} />
                <meshStandardMaterial color="#9ca3af" />
            </mesh>
        </group>
    );
}

/** Lantai/plaza datar (ubin) berbentuk persegi atau lingkaran. */
export function Plaza({ p = [0, 0.015, 0], size = [10, 10], c = '#e5e7eb', circle = false, r = 0 }) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, r]} position={p} receiveShadow>
            {circle ? <circleGeometry args={[size[0], 40]} /> : <planeGeometry args={size} />}
            <meshStandardMaterial color={c} roughness={0.9} />
        </mesh>
    );
}

export function Bench({ p = [0, 0, 0], r = 0, c = '#92400e' }) {
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.45, 0]} s={[1.6, 0.1, 0.5]} c={c} />
            <Box p={[0, 0.8, -0.22]} s={[1.6, 0.4, 0.08]} c={c} />
            <Box p={[-0.7, 0.22, 0]} s={[0.08, 0.45, 0.45]} c="#374151" />
            <Box p={[0.7, 0.22, 0]} s={[0.08, 0.45, 0.45]} c="#374151" />
        </group>
    );
}

export function Fence({ p = [0, 0, 0], length = 10, r = 0, c = '#f8fafc', post = '#64748b' }) {
    const posts = Math.max(2, Math.floor(length / 2) + 1);
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.9, 0]} s={[length, 0.1, 0.08]} c={c} />
            <Box p={[0, 0.5, 0]} s={[length, 0.1, 0.08]} c={c} />
            {Array.from({ length: posts }).map((_, i) => (
                <Box key={i} p={[-length / 2 + (i * length) / (posts - 1), 0.55, 0]} s={[0.14, 1.1, 0.14]} c={post} />
            ))}
        </group>
    );
}

/** Gedung bertingkat dengan jendela bercahaya. */
export function Building({ p = [0, 0, 0], size = [5, 10, 5], c = '#0f172a', lit = '#bae6fd', roof = '#334155', r = 0, cols, rows, metal = 0.2 }) {
    const [w, h, d] = size;
    const tex = useWindowTexture(c, lit, cols || Math.max(2, Math.round(w / 1.2)), rows || Math.max(2, Math.round(h / 1.4)));
    return (
        <group position={p} rotation={[0, r, 0]}>
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial map={tex} metalness={metal} roughness={0.45} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.18} />
            </mesh>
            <Box p={[0, h + 0.15, 0]} s={[w + 0.2, 0.3, d + 0.2]} c={roof} />
        </group>
    );
}

/* ---------- Langit & latar belakang ---------- */

export function Mountain({ p = [0, 0, -60], scale = 1, c = '#4d7c0f', snow }) {
    return (
        <group position={p} scale={scale}>
            <Cone p={[0, 7, 0]} a={[14, 14, 7]} c={c} />
            {snow && <Cone p={[0, 12.2, 0]} a={[4.9, 3.6, 7]} c={snow} />}
        </group>
    );
}

export function Cloud({ p = [0, 18, -30], scale = 1, speed = 0.4 }) {
    const ref = useRef();
    useFrame((_, dt) => {
        if (!ref.current) return;
        ref.current.position.x += speed * dt;
        if (ref.current.position.x > 70) ref.current.position.x = -70;
    });
    return (
        <group ref={ref} position={p} scale={scale}>
            <Sphere p={[0, 0, 0]} a={[2, 7, 5]} c="#ffffff" rough={1} />
            <Sphere p={[1.8, -0.3, 0.3]} a={[1.5, 7, 5]} c="#ffffff" rough={1} />
            <Sphere p={[-1.9, -0.4, 0]} a={[1.4, 7, 5]} c="#f8fafc" rough={1} />
        </group>
    );
}

/** Asap animasi yang naik dari cerobong. */
export function Smoke({ p = [0, 0, 0], color = '#e5e7eb', count = 6, height = 6, speed = 0.8 }) {
    const group = useRef();
    const offsets = useMemo(() => Array.from({ length: count }, (_, i) => i / count), [count]);
    useFrame((state) => {
        if (!group.current) return;
        const t = state.clock.elapsedTime * speed * 0.25;
        group.current.children.forEach((child, i) => {
            const k = (offsets[i] + t) % 1;
            child.position.set(Math.sin((k + i) * 3) * 0.4 * k, k * height, Math.cos((k + i) * 2) * 0.3 * k);
            const s = 0.5 + k * 1.6;
            child.scale.set(s, s, s);
            child.material.opacity = 0.75 * (1 - k);
        });
    });
    return (
        <group ref={group} position={p}>
            {offsets.map((_, i) => (
                <mesh key={i}>
                    <icosahedronGeometry args={[0.6, 0]} />
                    <meshStandardMaterial color={color} transparent opacity={0.6} depthWrite={false} flatShading />
                </mesh>
            ))}
        </group>
    );
}

/** Bendera Merah Putih berkibar. */
export function Flag({ p = [0, 0, 0], height = 8 }) {
    const flag = useRef();
    useFrame((state) => {
        if (flag.current) flag.current.rotation.y = Math.sin(state.clock.elapsedTime * 2.2) * 0.18;
    });
    return (
        <group position={p}>
            <Cyl p={[0, 0.25, 0]} a={[0.7, 0.9, 0.5, 8]} c="#e5e7eb" />
            <Cyl p={[0, height / 2, 0]} a={[0.06, 0.1, height, 8]} c="#f8fafc" metal={0.6} rough={0.3} />
            <Sphere p={[0, height + 0.1, 0]} a={[0.14, 8, 6]} c="#facc15" metal={0.6} />
            <group ref={flag} position={[0, height - 0.6, 0]}>
                <Box p={[0.95, 0.27, 0]} s={[1.8, 0.55, 0.04]} c="#dc2626" />
                <Box p={[0.95, -0.27, 0]} s={[1.8, 0.55, 0.04]} c="#ffffff" />
            </group>
        </group>
    );
}

/** Air mancur alun-alun dengan semburan beranimasi. */
export function Fountain({ p = [0, 0, 0], scale = 1 }) {
    const jet = useRef();
    useFrame((state) => {
        if (jet.current) {
            const s = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.12;
            jet.current.scale.set(1, s, 1);
        }
    });
    return (
        <group position={p} scale={scale}>
            <Cyl p={[0, 0.3, 0]} a={[3, 3.2, 0.6, 24]} c="#e2e8f0" />
            <Cyl p={[0, 0.55, 0]} a={[2.7, 2.7, 0.1, 24]} c="#38bdf8" emissive="#0ea5e9" ei={0.25} rough={0.15} />
            <Cyl p={[0, 1.1, 0]} a={[0.35, 0.5, 1.2, 10]} c="#cbd5e1" />
            <Cyl p={[0, 1.75, 0]} a={[1.1, 0.8, 0.25, 16]} c="#e2e8f0" />
            <group ref={jet}>
                <Cyl p={[0, 2.6, 0]} a={[0.06, 0.25, 1.6, 8]} c="#bae6fd" emissive="#7dd3fc" ei={0.5} />
            </group>
        </group>
    );
}

/** Lingkaran jarak pandang langit: bola langit gradasi sederhana. */
export function SkyDome({ top = '#60a5fa', bottom = '#e0f2fe' }) {
    const mat = useMemo(
        () =>
            new THREE.ShaderMaterial({
                side: THREE.BackSide,
                depthWrite: false,
                fog: false,
                uniforms: { top: { value: new THREE.Color(top) }, bottom: { value: new THREE.Color(bottom) } },
                vertexShader:
                    'varying vec3 vPos; void main(){ vPos = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position,1.0); }',
                fragmentShader:
                    'uniform vec3 top; uniform vec3 bottom; varying vec3 vPos; void main(){ float h = clamp(normalize(vPos).y * 1.6 + 0.15, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, h), 1.0); }',
            }),
        [top, bottom]
    );
    return (
        <mesh material={mat} renderOrder={-1}>
            <sphereGeometry args={[160, 24, 12]} />
        </mesh>
    );
}
