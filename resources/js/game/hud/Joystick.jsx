import React, { useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';

export default function Joystick() {
    const setJoystickVector = useGameStore((s) => s.setJoystickVector);
    const containerRef = useRef(null);
    const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
    const [active, setActive] = useState(false);
    const maxRadius = 42;

    const handleMove = (clientX, clientY) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const clampedDist = Math.min(dist, maxRadius);
        const nx = Math.cos(angle) * clampedDist;
        const ny = Math.sin(angle) * clampedDist;

        setKnobPos({ x: nx, y: ny });
        setJoystickVector({
            x: Number((nx / maxRadius).toFixed(3)),
            z: Number((ny / maxRadius).toFixed(3)),
        });
    };

    const handleEnd = () => {
        setActive(false);
        setKnobPos({ x: 0, y: 0 });
        setJoystickVector({ x: 0, z: 0 });
    };

    return (
        <div
            ref={containerRef}
            onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setActive(true);
                handleMove(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
                if (!active) return;
                handleMove(e.clientX, e.clientY);
            }}
            onPointerUp={handleEnd}
            onPointerCancel={handleEnd}
            className="w-28 h-28 rounded-full bg-slate-900/75 border-2 border-cyan-400/50 backdrop-blur-md flex items-center justify-center touch-none select-none shadow-xl"
            aria-label="Joystick pergerakan karakter"
        >
            <div
                style={{
                    transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                }}
                className={`w-12 h-12 rounded-full transition-colors ${
                    active
                        ? 'bg-gradient-to-br from-cyan-300 to-blue-500 shadow-lg shadow-cyan-400/40'
                        : 'bg-slate-700/90 border border-slate-500'
                }`}
            />
        </div>
    );
}
