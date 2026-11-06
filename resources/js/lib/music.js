import { create } from 'zustand';

/*
 * Backsound global: satu elemen <audio> tunggal di luar React, sehingga lagu
 * terus berjalan saat pindah halaman (beranda → login → dashboard → game).
 * Lagu diputar berulang (otomatis mulai lagi saat sampai ujung).
 * Browser memblokir suara otomatis sebelum ada interaksi, jadi bila gagal
 * autoplay, lagu dimulai pada sentuhan/klik/tombol pertama.
 */

export const MUSIC_CREDIT = 'Donkgedank - SAMAPTA (No Copyright music)';
const SRC = '/audio/samapta.mp3';
const VOLUME = 0.35;
const KEY = 'bahasa_play_music_muted';

const readMuted = () => {
    try {
        return localStorage.getItem(KEY) === '1';
    } catch {
        return false;
    }
};

let audio = null;
let started = false;

export const useMusic = create((set, get) => ({
    muted: readMuted(),
    playing: false,
    hudEmbedded: false, // true saat tombol musik ditampilkan di HUD game

    setHudEmbedded: (v) => set({ hudEmbedded: v }),

    toggleMute: () => {
        const muted = !get().muted;
        try {
            localStorage.setItem(KEY, muted ? '1' : '0');
        } catch {
            /* abaikan */
        }
        set({ muted });
        if (audio) {
            audio.muted = muted;
            if (!muted) tryPlay();
        }
    },
}));

function tryPlay() {
    if (!audio) return Promise.resolve(false);
    return audio
        .play()
        .then(() => {
            started = true;
            useMusic.setState({ playing: true });
            return true;
        })
        .catch(() => false);
}

export function initMusic() {
    if (audio || typeof window === 'undefined') return;

    audio = new Audio('/audio/samapta.mp3');
    audio.loop = true; // sampai ujung lagu → otomatis putar lagi
    audio.preload = 'auto';
    audio.volume = VOLUME;
    audio.muted = useMusic.getState().muted;

    // Cadangan bila `loop` tidak dihormati perangkat
    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        tryPlay();
    });
    audio.addEventListener('play', () => useMusic.setState({ playing: true }));

    // Hemat baterai: jeda saat tab disembunyikan, lanjut saat kembali
    document.addEventListener('visibilitychange', () => {
        if (!started) return;
        if (document.hidden) audio.pause();
        else tryPlay();
    });

    // Coba autoplay langsung; bila diblokir, mulai pada interaksi pertama
    tryPlay().then((ok) => {
        if (ok) return;
        const events = ['pointerdown', 'keydown', 'touchstart'];
        const unlock = () => {
            tryPlay().then((done) => {
                if (done) events.forEach((e) => window.removeEventListener(e, unlock, true));
            });
        };
        events.forEach((e) => window.addEventListener(e, unlock, true));
    });
}

export { SRC as MUSIC_SRC };
