import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/*
 * Pustaka Tekstur Prosedural Batik Banten & Wajah Humanoid Roblox.
 * Menghasilkan tekstur Canvas beresolusi tinggi tanpa unduhan aset eksternal.
 *
 * Ciri khas Batik Banten (hasil ekskavasi Kesultanan Banten):
 * - Ragam hias geometris: belah ketupat (rhombus), ornamen bintang segi-8, sulur bunga
 * - Palet warna pastel & lembut: abu-abu lembut (grey filosofis Banten), biru toska,
 *   kuning emas/tembaga, krem terakota, dan merah bata.
 * - Motif terkenal: Datulaya, Mandalikan, Sabakingking, Surosowan, Kawangsan.
 */

const textureCache = new Map();

/**
 * Generator Tekstur Kemeja Batik Banten
 */
export function useBatikBantenTexture({
    baseColor = '#cbd5e1',     // Warna dasar kain (abu-abu lembut khas Banten)
    patternColor = '#b45309',  // Warna belah ketupat / ornamen emas tembaga
    accentColor = '#0369a1',   // Aksen biru toska Kesultanan
    motifName = 'Mandalikan',  // 'Mandalikan' | 'Datulaya' | 'Sabakingking' | 'Surosowan'
} = {}) {
    return useMemo(() => {
        const cacheKey = `batik-${baseColor}-${patternColor}-${accentColor}-${motifName}`;
        if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // 1. Warna dasar kain batik
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 512, 512);

        // 2. Tekstur serat kain halus
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        for (let i = 0; i < 512; i += 4) {
            ctx.fillRect(0, i, 512, 2);
            ctx.fillRect(i, 0, 2, 512);
        }

        // 3. Grid Motif Geometris Batik Banten (Belah Ketupat & Ornamen Bintang)
        const step = 64;
        for (let y = -step; y < 512 + step; y += step) {
            for (let x = -step; x < 512 + step; x += step) {
                const cx = x + ((y / step) % 2 === 0 ? 0 : step / 2);
                const cy = y;

                // Belah ketupat luar (Garis tebal khas Batik Banten)
                ctx.save();
                ctx.translate(cx, cy);

                ctx.strokeStyle = patternColor;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(0, -26);
                ctx.lineTo(26, 0);
                ctx.lineTo(0, 26);
                ctx.lineTo(-26, 0);
                ctx.closePath();
                ctx.stroke();

                // Belah ketupat dalam berbingkai
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fill();

                ctx.strokeStyle = accentColor;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(0, -18);
                ctx.lineTo(18, 0);
                ctx.lineTo(0, 18);
                ctx.lineTo(-18, 0);
                ctx.closePath();
                ctx.stroke();

                // Bintang segi-8 / Bunga Mandalikan di tengah
                ctx.fillStyle = patternColor;
                ctx.beginPath();
                ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
                ctx.fill();

                // 4 Kelopak bunga sudut
                const petals = [[0, -9], [9, 0], [0, 9], [-9, 0]];
                ctx.fillStyle = accentColor;
                petals.forEach(([px, py]) => {
                    ctx.beginPath();
                    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                });

                ctx.restore();
            }
        }

        // 4. Detail Kemeja Resmi: Kerah kemeja, plaket kancing, dan saku dada
        // Plaket kancing tengah kemeja
        ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
        ctx.fillRect(244, 0, 24, 512);
        ctx.strokeStyle = patternColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(244, 0, 24, 512);

        // Kancing kemeja emas bulat
        for (let ky = 70; ky < 500; ky += 85) {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(256, ky, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Kerah kemeja V di bagian atas
        ctx.fillStyle = patternColor;
        ctx.beginPath();
        ctx.moveTo(210, 0);
        ctx.lineTo(256, 55);
        ctx.lineTo(240, 58);
        ctx.lineTo(195, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(302, 0);
        ctx.lineTo(256, 55);
        ctx.lineTo(272, 58);
        ctx.lineTo(317, 0);
        ctx.closePath();
        ctx.fill();

        // Saku dada kiri (di posisi 130, 150)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(130, 150, 65, 75);
        ctx.strokeStyle = patternColor;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(130, 150, 65, 75);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        textureCache.set(cacheKey, tex);
        return tex;
    }, [baseColor, patternColor, accentColor, motifName]);
}

/**
 * Generator Tekstur Wajah Humanoid Roblox (Muka Anime Ramah)
 */
export function useRobloxFaceTexture({ skinColor = '#fde68a', gender = 'boy' } = {}) {
    return useMemo(() => {
        const cacheKey = `face-${skinColor}-${gender}`;
        if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Warna dasar kulit wajah
        ctx.fillStyle = skinColor;
        ctx.fillRect(0, 0, 256, 256);

        // Dua Mata Roblox Berkilau Ramah
        const drawEye = (x, y) => {
            // Mata luar hitam
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(x, y, 16, 22, 0, 0, Math.PI * 2);
            ctx.fill();

            // Iris biru / cokelat gelap
            ctx.fillStyle = '#1e3a8a';
            ctx.beginPath();
            ctx.ellipse(x, y + 2, 12, 16, 0, 0, Math.PI * 2);
            ctx.fill();

            // Kilau cahaya putih besar (sparkle)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x - 5, y - 6, 6, 0, Math.PI * 2);
            ctx.fill();

            // Kilau cahaya putih kecil
            ctx.beginPath();
            ctx.arc(x + 5, y + 6, 3, 0, Math.PI * 2);
            ctx.fill();
        };

        drawEye(85, 115);
        drawEye(171, 115);

        // Alis mata melengkung ramah
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(85, 96, 20, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(171, 96, 20, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Senyum Manis Roblox
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(128, 155, 26, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();

        // Gigi putih di dalam senyum
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(128, 157, 18, Math.PI * 0.2, Math.PI * 0.8);
        ctx.fill();

        // Rona pipi merah muda lembut (blush)
        ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
        ctx.beginPath();
        ctx.arc(60, 145, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(196, 145, 14, 0, Math.PI * 2);
        ctx.fill();

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        textureCache.set(cacheKey, tex);
        return tex;
    }, [skinColor, gender]);
}

/**
 * Komponen Karakter Humanoid Roblox 3D Lengkap
 * - Memakai Kemeja Batik Banten Otentik
 * - Celana Abu-Abu Seragam SMA / Celana Panjang Resmi
 * - Sepatu Sekolah Hitam-Putih
 * - Rambut / Iket Kepala Sunda Banten / Peci
 * - Animasi Ayunan Langkah Berjalan Prosedural (Procedural Walk Cycle)
 * - Name Tag Billboard Gaya Roblox
 */
export default function RobloxCharacter({
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    name = 'Siswa',
    roleLabel = 'Siswa Kelas XII',
    isPlayer = false,
    isMoving = false,
    batikPreset = 'siswa', // 'siswa' | 'guru' | 'budayawan' | 'duta'
    hairStyle = 'short',   // 'short' | 'iket' | 'peci' | 'hijab'
    hairColor = '#1e1b4b',
    pantsColor = '#334155', // Celana seragam abu-abu SMA
    skinColor = '#fde68a',
    distance = null,
    isTarget = false,
    showNameTag = true,
    onClick,
}) {
    // Preset Batik Banten
    const batikProps = useMemo(() => {
        if (batikPreset === 'guru') {
            return {
                baseColor: '#0c4a6e',    // Biru gelap Kesultanan
                patternColor: '#f59e0b', // Emas tembaga
                accentColor: '#38bdf8',  // Cyan toska
                motifName: 'Datulaya',
            };
        }
        if (batikPreset === 'budayawan') {
            return {
                baseColor: '#78350f',    // Terakota cokelat tua
                patternColor: '#fef08a', // Emas muda
                accentColor: '#b45309',  // Tembaga
                motifName: 'Sabakingking',
            };
        }
        if (batikPreset === 'duta') {
            return {
                baseColor: '#581c87',    // Ungu anggun
                patternColor: '#fde047', // Emas
                accentColor: '#c084fc',  // Lavender pastel
                motifName: 'Kawangsan',
            };
        }
        // Default: Siswa SMA (Kemeja Batik Banten Mandalikan Abu-Abu Lembut)
        return {
            baseColor: '#e2e8f0',     // Abu-abu terang khas seragam batik sekolah
            patternColor: '#b45309',  // Cokelat emas tembaga
            accentColor: '#0284c7',   // Biru Banten
            motifName: 'Mandalikan',
        };
    }, [batikPreset]);

    const batikTexture = useBatikBantenTexture(batikProps);
    const faceTexture = useRobloxFaceTexture({ skinColor });

    // Node refs untuk animasi ayunan tubuh, lengan, dan kaki
    const rootRef = useRef();
    const torsoRef = useRef();
    const headRef = useRef();
    const leftArmRef = useRef();
    const rightArmRef = useRef();
    const leftLegRef = useRef();
    const rightLegRef = useRef();

    const walkTime = useRef(0);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;

        if (isMoving) {
            walkTime.current += delta * 10;
            const cycle = walkTime.current;

            // Kaki kiri & kanan berayun maju mundur berlawanan
            if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(cycle) * 0.7;
            if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(cycle) * 0.7;

            // Lengan kiri & kanan berayun berlawanan dengan kaki
            if (leftArmRef.current) {
                leftArmRef.current.rotation.x = -Math.sin(cycle) * 0.65;
                leftArmRef.current.rotation.z = -0.1;
            }
            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = Math.sin(cycle) * 0.65;
                rightArmRef.current.rotation.z = 0.1;
            }

            // Tubuh sedikit membal naik turun khas langkah Roblox
            if (torsoRef.current) {
                torsoRef.current.position.y = 1.35 + Math.abs(Math.sin(cycle * 2)) * 0.08;
            }
        } else {
            // Idle stance (bernafas lembut dan lengan santai)
            const idleBreathe = Math.sin(t * 2.2) * 0.025;
            if (torsoRef.current) {
                torsoRef.current.position.y = 1.35 + idleBreathe;
            }
            if (leftArmRef.current) {
                leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.15);
                leftArmRef.current.rotation.z = -0.08;
            }
            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.15);
                rightArmRef.current.rotation.z = 0.08;
            }
            if (leftLegRef.current) {
                leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.15);
            }
            if (rightLegRef.current) {
                rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.15);
            }
        }
    });

    return (
        <group ref={rootRef} position={position} rotation={rotation} onClick={onClick}>
            {/* Bayangan Bulat Halus di Bawah Kaki (Blob Shadow) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <circleGeometry args={[0.9, 16]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.25} />
            </mesh>

            {/* KAKI KIRI (Left Leg) - Pivot di pinggul */}
            <group ref={leftLegRef} position={[-0.42, 0.85, 0]}>
                {/* Celana panjang */}
                <mesh position={[0, -0.4, 0]} castShadow>
                    <boxGeometry args={[0.74, 1.0, 0.76]} />
                    <meshStandardMaterial color={pantsColor} roughness={0.7} />
                </mesh>
                {/* Sepatu Sekolah Hitam */}
                <mesh position={[0, -0.78, 0.04]} castShadow>
                    <boxGeometry args={[0.76, 0.28, 0.86]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.5} />
                </mesh>
                {/* Sol Sepatu Putih Khas Sneakers */}
                <mesh position={[0, -0.89, 0.04]}>
                    <boxGeometry args={[0.78, 0.08, 0.88]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.4} />
                </mesh>
            </group>

            {/* KAKI KANAN (Right Leg) - Pivot di pinggul */}
            <group ref={rightLegRef} position={[0.42, 0.85, 0]}>
                {/* Celana panjang */}
                <mesh position={[0, -0.4, 0]} castShadow>
                    <boxGeometry args={[0.74, 1.0, 0.76]} />
                    <meshStandardMaterial color={pantsColor} roughness={0.7} />
                </mesh>
                {/* Sepatu Sekolah Hitam */}
                <mesh position={[0, -0.78, 0.04]} castShadow>
                    <boxGeometry args={[0.76, 0.28, 0.86]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.5} />
                </mesh>
                {/* Sol Sepatu Putih Khas Sneakers */}
                <mesh position={[0, -0.89, 0.04]}>
                    <boxGeometry args={[0.78, 0.08, 0.88]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.4} />
                </mesh>
            </group>

            {/* TORSO & BAGIAN ATAS TUBUH */}
            <group ref={torsoRef} position={[0, 1.35, 0]}>
                {/* Pinggul / Sabuk Gesper */}
                <mesh position={[0, 0.05, 0]}>
                    <boxGeometry args={[1.56, 0.15, 0.82]} />
                    <meshStandardMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0, 0.05, 0.42]}>
                    <boxGeometry args={[0.26, 0.14, 0.04]} />
                    <meshStandardMaterial color="#f59e0b" metalness={0.8} />
                </mesh>

                {/* Badan Kemeja Batik Banten (Torso Blok Roblox 1.6 x 1.4 x 0.84) */}
                <mesh position={[0, 0.75, 0]} castShadow>
                    <boxGeometry args={[1.62, 1.35, 0.84]} />
                    <meshStandardMaterial
                        map={batikTexture}
                        roughness={0.65}
                        metalness={0.05}
                    />
                </mesh>

                {/* Kerah Kemeja 3D Timbul */}
                <mesh position={[0, 1.45, 0.15]} rotation={[0.25, 0, 0]}>
                    <boxGeometry args={[0.85, 0.16, 0.65]} />
                    <meshStandardMaterial color={batikProps.patternColor} roughness={0.6} />
                </mesh>

                {/* LENGAN KIRI (Left Arm) - Pivot di bahu */}
                <group ref={leftArmRef} position={[-1.18, 1.25, 0]}>
                    {/* Lengan kemeja batik Banten */}
                    <mesh position={[0, -0.4, 0]} castShadow>
                        <boxGeometry args={[0.68, 0.9, 0.76]} />
                        <meshStandardMaterial map={batikTexture} roughness={0.65} />
                    </mesh>
                    {/* Tangan Roblox warna kulit */}
                    <mesh position={[0, -0.92, 0]} castShadow>
                        <boxGeometry args={[0.64, 0.45, 0.7]} />
                        <meshStandardMaterial color={skinColor} roughness={0.45} />
                    </mesh>
                </group>

                {/* LENGAN KANAN (Right Arm) - Pivot di bahu */}
                <group ref={rightArmRef} position={[1.18, 1.25, 0]}>
                    {/* Lengan kemeja batik Banten */}
                    <mesh position={[0, -0.4, 0]} castShadow>
                        <boxGeometry args={[0.68, 0.9, 0.76]} />
                        <meshStandardMaterial map={batikTexture} roughness={0.65} />
                    </mesh>
                    {/* Tangan Roblox warna kulit */}
                    <mesh position={[0, -0.92, 0]} castShadow>
                        <boxGeometry args={[0.64, 0.45, 0.7]} />
                        <meshStandardMaterial color={skinColor} roughness={0.45} />
                    </mesh>
                </group>

                {/* KEPALA & WAJAH (Head & Face) */}
                <group ref={headRef} position={[0, 1.95, 0]}>
                    {/* Leher silinder */}
                    <mesh position={[0, -0.38, 0]}>
                        <cylinderGeometry args={[0.22, 0.26, 0.25, 8]} />
                        <meshStandardMaterial color={skinColor} roughness={0.4} />
                    </mesh>

                    {/* Kepala Blok Bersudut Halus Roblox (1.05 x 1.0 x 1.0) */}
                    <mesh castShadow>
                        <boxGeometry args={[1.05, 0.95, 0.95]} />
                        <meshStandardMaterial color={skinColor} roughness={0.4} />
                    </mesh>

                    {/* Muka Depan Bertekstur Senyum Ramah Roblox */}
                    <mesh position={[0, 0, 0.48]}>
                        <planeGeometry args={[1.0, 0.9]} />
                        <meshBasicMaterial map={faceTexture} transparent />
                    </mesh>

                    {/* AKSESORIS RAMBUT / IKET SUNDA BANTEN / PECI */}
                    {hairStyle === 'iket' ? (
                        /* Iket Kepala Khas Sunda Banten (Lomar) */
                        <group position={[0, 0.35, 0]}>
                            <mesh position={[0, 0, 0]}>
                                <boxGeometry args={[1.14, 0.28, 1.05]} />
                                <meshStandardMaterial color="#78350f" roughness={0.7} />
                            </mesh>
                            {/* Simpul segitiga iket di atas */}
                            <mesh position={[0, 0.25, -0.2]} rotation={[0.4, 0, 0]}>
                                <coneGeometry args={[0.35, 0.45, 4]} />
                                <meshStandardMaterial color="#92400e" roughness={0.7} />
                            </mesh>
                        </group>
                    ) : hairStyle === 'peci' ? (
                        /* Peci Hitam Nasional */
                        <mesh position={[0, 0.52, 0]}>
                            <boxGeometry args={[1.08, 0.42, 0.98]} />
                            <meshStandardMaterial color="#0f172a" roughness={0.8} />
                        </mesh>
                    ) : (
                        /* Rambut Low-Poly Stylized Roblox */
                        <group position={[0, 0.42, 0]}>
                            <mesh position={[0, 0.08, 0]}>
                                <boxGeometry args={[1.12, 0.28, 1.04]} />
                                <meshStandardMaterial color={hairColor} roughness={0.7} />
                            </mesh>
                            {/* Poni depan low-poly */}
                            <mesh position={[0, -0.06, 0.48]}>
                                <boxGeometry args={[0.95, 0.18, 0.16]} />
                                <meshStandardMaterial color={hairColor} roughness={0.7} />
                            </mesh>
                            {/* Rambut samping kiri dan kanan */}
                            <mesh position={[-0.54, -0.12, 0]}>
                                <boxGeometry args={[0.12, 0.35, 0.9]} />
                                <meshStandardMaterial color={hairColor} roughness={0.7} />
                            </mesh>
                            <mesh position={[0.54, -0.12, 0]}>
                                <boxGeometry args={[0.12, 0.35, 0.9]} />
                                <meshStandardMaterial color={hairColor} roughness={0.7} />
                            </mesh>
                        </group>
                    )}

                    {/* NAME TAG BILLBOARD GAYA ROBLOX */}
                    {showNameTag && (
                    <Html position={[0, 1.35, 0]} center distanceFactor={isPlayer ? 8 : 15} zIndexRange={[15, 0]}>
                        <div className={`px-3 py-1 rounded-xl text-center shadow-2xl pointer-events-none transition-all flex flex-col items-center gap-0.5 ${
                            isPlayer
                                ? 'bg-cyan-950/90 border border-cyan-400 text-white'
                                : isTarget
                                ? 'bg-amber-950/95 border-2 border-amber-400 text-amber-100 ring-4 ring-amber-400/40'
                                : 'bg-slate-950/85 border border-slate-700/80 text-slate-100'
                        }`}>
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <span className="text-[10px]">
                                    {isPlayer ? '🎓' : isTarget ? '🎯' : '👤'}
                                </span>
                                <span className="font-extrabold text-xs text-white tracking-wide">
                                    {name}
                                </span>
                                {distance !== null && (
                                    <span className="text-[10px] font-bold text-amber-300 ml-1">
                                        {Math.round(distance)}m
                                    </span>
                                )}
                            </div>
                            <span className="text-[9px] text-cyan-300 font-medium">
                                {roleLabel}
                            </span>
                        </div>
                    </Html>
                    )}
                </group>
            </group>
        </group>
    );
}
