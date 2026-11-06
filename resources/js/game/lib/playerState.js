/*
 * playerState — status pemain & kamera yang berubah setiap frame.
 *
 * Disimpan sebagai objek mutable (bukan state React/Zustand) agar minimap dan HUD
 * bisa membacanya lewat requestAnimationFrame tanpa memicu render ulang komponen.
 * Ditulis oleh ZoneScene, dibaca oleh MiniMap.
 */
export const playerState = {
    x: 0,
    z: 12,
    heading: Math.PI, // arah hadap karakter (rotasi Y)
    camYaw: 0, // 0 = kamera di selatan pemain, menghadap utara (-Z)
};

/** Masukan kamera dari pointer (mouse/touchpad/sentuh) yang dikonsumsi ZoneScene. */
export const cameraInput = {
    dx: 0, // akumulasi geser horizontal (px)
    dy: 0, // akumulasi geser vertikal (px)
    zoom: 0, // akumulasi zoom (+ menjauh, - mendekat)
};
