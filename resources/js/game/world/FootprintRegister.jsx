import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { registerFootprint, registerCameraBlock, clearFootprint, FOOTPRINT_CORE } from './worldGrid';

/*
 * FootprintRegister — mencatat jejak bangunan inti peta BAB (masjid, pabrik, sekolah, dsb.)
 * ke grid minimap dan sebagai penghalang kamera, satu kali setelah dirender.
 * Tidak menambah tabrakan pemain, tidak mengubah tampilan.
 */
export default function FootprintRegister({ children }) {
    const ref = useRef();
    useEffect(() => {
        const root = ref.current;
        if (!root) return undefined;
        root.updateWorldMatrix(true, true);
        const box = new THREE.Box3();
        root.traverse((obj) => {
            if (!obj.isMesh || !obj.geometry) return;
            if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
            box.copy(obj.geometry.boundingBox).applyMatrix4(obj.matrixWorld);
            registerFootprint(box, obj.geometry.type, FOOTPRINT_CORE);
            registerCameraBlock(box, obj.geometry.type);
        });
        return () => clearFootprint(FOOTPRINT_CORE);
    }, []);
    return <group ref={ref}>{children}</group>;
}
