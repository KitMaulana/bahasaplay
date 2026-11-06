import React, { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { registerBox, clearWorldGrid } from './worldGrid';

/*
 * StaticBatch — penggabung mesh statis otomatis.
 *
 * Peta bergaya Roblox (Brookhaven/Livetopia) butuh ribuan potongan primitif kecil
 * (jendela, pagar, roda mobil, dsb). Jika dirender satu per satu, ponsel akan berat
 * karena ribuan draw call. Komponen ini merender anak-anaknya sekali, lalu
 * menggabungkan semua geometri yang memakai material serupa menjadi satu mesh.
 * Hasilnya: ribuan mesh → puluhan draw call, tanpa mengubah tampilan.
 *
 * Aturan: JANGAN menaruh objek beranimasi (useFrame) atau <Html> di dalamnya.
 */

function materialKey(m, mesh) {
    return [
        m.type,
        m.color ? m.color.getHexString() : '',
        m.emissive ? m.emissive.getHexString() : '',
        m.emissiveIntensity ?? 0,
        m.metalness ?? 0,
        m.roughness ?? 0,
        m.map ? m.map.uuid : '',
        m.emissiveMap ? m.emissiveMap.uuid : '',
        m.transparent ? 1 : 0,
        m.opacity,
        m.flatShading ? 1 : 0,
        m.side,
        m.depthWrite ? 1 : 0,
        mesh.castShadow ? 1 : 0,
        mesh.receiveShadow ? 1 : 0,
    ].join('|');
}

export default function StaticBatch({ children, registerBlockers = false }) {
    const source = useRef();
    const output = useRef();

    useLayoutEffect(() => {
        const src = source.current;
        const out = output.current;
        if (!src || !out) return undefined;

        src.updateWorldMatrix(true, true);
        const inv = new THREE.Matrix4().copy(src.matrixWorld).invert();
        const rel = new THREE.Matrix4();
        const buckets = new Map();
        const bbox = new THREE.Box3();

        src.traverse((obj) => {
            if (!obj.isMesh || !obj.geometry || Array.isArray(obj.material)) return;
            if (registerBlockers) {
                if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
                bbox.copy(obj.geometry.boundingBox).applyMatrix4(obj.matrixWorld);
                registerBox(bbox, obj.geometry.type);
            }
            const key = materialKey(obj.material, obj);
            rel.multiplyMatrices(inv, obj.matrixWorld);
            let g = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry.clone();
            // Samakan atribut agar bisa digabung (posisi, normal, uv).
            Object.keys(g.attributes).forEach((name) => {
                if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
            });
            if (!g.attributes.normal) g.computeVertexNormals();
            if (!g.attributes.uv) {
                g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
            }
            g.morphAttributes = {};
            g.applyMatrix4(rel);
            if (!buckets.has(key)) buckets.set(key, { material: obj.material, mesh: obj, geos: [] });
            buckets.get(key).geos.push(g);
        });

        const created = [];
        buckets.forEach(({ material, mesh, geos }) => {
            const merged = mergeGeometries(geos, false);
            geos.forEach((g) => g.dispose());
            if (!merged) return;
            merged.computeBoundingSphere();
            const m = new THREE.Mesh(merged, material);
            m.castShadow = mesh.castShadow;
            m.receiveShadow = mesh.receiveShadow;
            m.matrixAutoUpdate = false;
            out.add(m);
            created.push(m);
        });

        // Sembunyikan mesh asli; hanya hasil gabungan yang dirender.
        src.visible = false;
        src.traverse((o) => {
            o.matrixAutoUpdate = false;
        });

        return () => {
            created.forEach((m) => {
                out.remove(m);
                m.geometry.dispose();
            });
            src.traverse((o) => {
                o.matrixAutoUpdate = true;
            });
            src.visible = true;
            if (registerBlockers) clearWorldGrid();
        };
    }, [registerBlockers]);

    return (
        <group>
            <group ref={source}>{children}</group>
            <group ref={output} />
        </group>
    );
}
