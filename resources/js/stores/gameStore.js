import { create } from 'zustand';

export const useGameStore = create((set) => ({
    activeZone: null,
    activeNpc: null,
    activeMaterial: null,
    joystickVector: { x: 0, z: 0 },
    interactPressed: false,
    fps: 60,
    setActiveZone: (activeZone) => set({ activeZone }),
    setActiveNpc: (activeNpc) => set({ activeNpc }),
    setActiveMaterial: (activeMaterial) => set({ activeMaterial }),
    setJoystickVector: (joystickVector) => set({ joystickVector }),
    setInteractPressed: (interactPressed) => set({ interactPressed }),
    setFps: (fps) => set({ fps }),
}));
