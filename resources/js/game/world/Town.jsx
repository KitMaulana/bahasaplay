import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import StaticBatch from './StaticBatch';
import { Box, SignBoard, Tree, PineTree, PalmTree, Bush, StreetLamp, Rock } from './Primitives';
import {
    HouseLot,
    Shop,
    Apartment,
    GasStation,
    Clinic,
    FireStation,
    PoliceStation,
    PocketPark,
    BasketCourt,
    BusStop,
    TrafficLight,
    StreetSign,
    Hydrant,
    TrashBin,
    PowerPole,
    CarBody,
    RiceField,
    Saung,
    BambooClump,
    BananaTree,
    KampungHouse,
} from './TownProps';
import RobloxCharacter from '../characters/RobloxCharacter';

/*
 * Town — lapisan "kota sekitar" bergaya Roblox Brookhaven / Livetopia
 * yang mengelilingi area belajar inti setiap BAB.
 *
 * Tata letak (koordinat dunia, area inti peta BAB berada di |x| < 44, -36 < z < 22):
 *   - Jalan lingkar: selatan z=28, utara z=-42, barat x=-50, timur x=50 (lebar 8 + trotoar).
 *   - Kavling selatan (menghadap utara), barat (menghadap timur), timur (fasilitas umum), utara.
 *   - Sabuk pepohonan di luar batas jelajah pemain.
 *
 * Gaya:
 *   - 'city'   : ruko & apartemen, lalu lintas ramai, bus kota.
 *   - 'suburb' : perumahan warga, taman bermain, lapangan basket.
 *   - 'rural'  : kampung asri — sawah, saung, rumpun bambu, sungai; tanpa kendaraan bermotor.
 */

export const TOWN_LAYOUT = {
    roadW: 8,
    southZ: 28,
    northZ: -42,
    westX: -50,
    eastX: 50,
    extent: 95,
    // Batas jelajah pemain (dipakai ZoneScene untuk clamp).
    bounds: { minX: -64, maxX: 64, minZ: -60, maxZ: 48 },
};

/*
 * Gaya kota sekitar per map_key (dipakai ZoneScene & minimap):
 * - city   : kota padat (ruko, apartemen, lalu lintas ramai)
 * - suburb : perumahan warga & fasilitas umum
 * - rural  : kampung asri tanpa kendaraan (kawasan Baduy/kampung — santun & tidak stereotip)
 */
export function townConfigFor(mapKey) {
    const k = mapKey || 'cilegon';
    if (['baduy', 'kampung'].includes(k)) return { style: 'rural', townName: null };
    if (['cilegon', 'alun_cilegon', 'kawasan_industri', 'pusat_kota'].includes(k)) return { style: 'city', townName: 'KOTA CILEGON', waterWest: true };
    if (['gading_serpong', 'alun_tangsel', 'kawasan_bisnis'].includes(k)) return { style: 'city', townName: 'KOTA TANGERANG SELATAN' };
    if (['banten_lama', 'royal_baroe', 'alun_serang', 'masjid_agung'].includes(k)) return { style: k === 'royal_baroe' ? 'city' : 'suburb', townName: 'KOTA SERANG' };
    if (k === 'alun_lebak') return { style: 'suburb', townName: 'RANGKASBITUNG' };
    if (['pandeglang', 'alun_pandeglang', 'taman_literasi', 'pojok_baca'].includes(k)) return { style: 'suburb', townName: 'KABUPATEN PANDEGLANG' };
    if (['smancir', 'kampus_smancir', 'gerbang_lapangan', 'tata_usaha'].includes(k)) return { style: 'suburb', townName: 'KECAMATAN CIRUAS' };
    return { style: 'suburb', townName: null };
}

const { roadW: W, southZ: SZ, northZ: NZ, westX: WX, eastX: EX, extent: E } = TOWN_LAYOUT;
const WATER_X = -32; // ujung barat jalan bila sisi barat berupa laut (Cilegon)
const SW_OFF = W / 2 + 1.2; // jarak pusat jalan ke pusat trotoar
const LOT_EDGE = W / 2 + 2.4; // jarak pusat jalan ke tepi luar trotoar

/* ---------- Pseudo-random deterministik ---------- */
function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

/* ---------- Jalan ---------- */

/** Ruas jalan lurus sepanjang sumbu Z lokal (putar π/2 untuk sumbu X). */
function StreetSeg({ p, length, r = 0, rural }) {
    if (rural) {
        return (
            <group position={p} rotation={[0, r, 0]}>
                <Box p={[0, 0.03, 0]} s={[4.2, 0.06, length]} c="#b08a5a" rough={1} />
                <Box p={[0, 0.04, 0]} s={[1.2, 0.06, length]} c="#c4a072" rough={1} />
            </group>
        );
    }
    const dashes = Math.floor(length / 4);
    const joints = Math.floor(length / 3);
    return (
        <group position={p} rotation={[0, r, 0]}>
            <Box p={[0, 0.03, 0]} s={[W, 0.06, length]} c="#3f3f46" rough={0.95} receive />
            {Array.from({ length: dashes }).map((_, i) => (
                <Box key={i} p={[0, 0.065, -length / 2 + 2 + i * 4]} s={[0.2, 0.02, 2]} c="#fafafa" />
            ))}
            {[-1, 1].map((side) => (
                <group key={side}>
                    <Box p={[side * (W / 2 - 0.35), 0.065, 0]} s={[0.14, 0.02, length]} c="#fde047" />
                    <Box p={[side * (W / 2 + 0.09), 0.12, 0]} s={[0.18, 0.24, length]} c="#a1a1aa" />
                    <Box p={[side * SW_OFF, 0.1, 0]} s={[2.4, 0.2, length]} c="#d4d4d8" receive />
                    {Array.from({ length: joints }).map((_, i) => (
                        <Box key={i} p={[side * SW_OFF, 0.205, -length / 2 + 1.5 + i * 3]} s={[2.4, 0.01, 0.06]} c="#a1a1aa" />
                    ))}
                </group>
            ))}
        </group>
    );
}

function segX(z, x1, x2, rural, key) {
    return <StreetSeg key={key} p={[(x1 + x2) / 2, 0, z]} length={x2 - x1} r={Math.PI / 2} rural={rural} />;
}
function segZ(x, z1, z2, rural, key) {
    return <StreetSeg key={key} p={[x, 0, (z1 + z2) / 2]} length={z2 - z1} rural={rural} />;
}

/** Persimpangan: aspal, sudut trotoar, zebra cross, lampu lalu lintas. */
function Intersection({ p, rural, names }) {
    if (rural) {
        return <Box p={[p[0], 0.03, p[2]]} s={[4.2, 0.06, 4.2]} c="#b08a5a" rough={1} />;
    }
    const zebra = (axis, offset, k) =>
        Array.from({ length: 6 }).map((_, i) => {
            const across = -W / 2 + 0.9 + i * ((W - 1.8) / 5);
            return axis === 'z' ? (
                <Box key={`${k}${i}`} p={[across, 0.065, offset]} s={[0.6, 0.02, 2.2]} c="#fafafa" />
            ) : (
                <Box key={`${k}${i}`} p={[offset, 0.065, across]} s={[2.2, 0.02, 0.6]} c="#fafafa" />
            );
        });
    return (
        <group position={p}>
            <Box p={[0, 0.03, 0]} s={[W, 0.06, W]} c="#3f3f46" rough={0.95} receive />
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
                <Box key={i} p={[sx * SW_OFF, 0.1, sz * SW_OFF]} s={[2.4, 0.2, 2.4]} c="#d4d4d8" />
            ))}
            {zebra('z', W / 2 + 1.4, 'a')}
            {zebra('z', -W / 2 - 1.4, 'b')}
            {zebra('x', W / 2 + 1.4, 'c')}
            {zebra('x', -W / 2 - 1.4, 'd')}
            <TrafficLight p={[-SW_OFF, 0.2, SW_OFF]} r={0} />
            <TrafficLight p={[SW_OFF, 0.2, -SW_OFF]} r={Math.PI} />
            {names && (
                <>
                    <StreetSign p={[SW_OFF, 0.2, SW_OFF]} r={0} text={names[0]} />
                    <StreetSign p={[-SW_OFF, 0.2, -SW_OFF]} r={Math.PI / 2} text={names[1]} />
                </>
            )}
        </group>
    );
}

function RoadNetwork({ rural, waterWest }) {
    const g = W / 2; // setengah lebar persimpangan
    const names = { s: 'JL. BAHASA', n: 'JL. SASTRA', w: 'JL. PUISI', e: 'JL. PANTUN' };
    return (
        <group>
            {!waterWest && segX(SZ, -E, WX - g, rural, 's1')}
            {segX(SZ, waterWest ? WATER_X : WX + g, EX - g, rural, 's2')}
            {segX(SZ, EX + g, E, rural, 's3')}
            {!waterWest && segX(NZ, -E, WX - g, rural, 'n1')}
            {segX(NZ, waterWest ? WATER_X : WX + g, EX - g, rural, 'n2')}
            {segX(NZ, EX + g, E, rural, 'n3')}
            {!waterWest && segZ(WX, -E, NZ - g, rural, 'w1')}
            {!waterWest && segZ(WX, NZ + g, SZ - g, rural, 'w2')}
            {!waterWest && segZ(WX, SZ + g, E, rural, 'w3')}
            {segZ(EX, -E, NZ - g, rural, 'e1')}
            {segZ(EX, NZ + g, SZ - g, rural, 'e2')}
            {segZ(EX, SZ + g, E, rural, 'e3')}
            {!waterWest && <Intersection p={[WX, 0, SZ]} rural={rural} names={[names.s, names.w]} />}
            <Intersection p={[EX, 0, SZ]} rural={rural} names={[names.s, names.e]} />
            {!waterWest && <Intersection p={[WX, 0, NZ]} rural={rural} names={[names.n, names.w]} />}
            <Intersection p={[EX, 0, NZ]} rural={rural} names={[names.n, names.e]} />
        </group>
    );
}

/** Buang elemen yang berada di sisi laut (barat) untuk peta pelabuhan. */
function dryOnly(items, waterWest) {
    if (!waterWest) return items;
    return items.filter((el) => {
        const pos = el.props.p || el.props.position || el.props.from;
        return !pos || pos[0] > WATER_X + 2;
    });
}

/* ---------- Perabot sepanjang jalan ---------- */

function StreetFurniture({ waterWest }) {
    const items = [];
    // Lampu jalan di trotoar dalam & luar jalan selatan/utara
    [-38, -22, -6, 10, 26, 40].forEach((x, i) => {
        items.push(<StreetLamp key={`ls${i}`} p={[x, 0.2, SZ - SW_OFF - 0.8]} r={-Math.PI / 2} />);
        items.push(<StreetLamp key={`ln${i}`} p={[x, 0.2, NZ + SW_OFF + 0.8]} r={Math.PI / 2} />);
    });
    [-30, -14, 2, 16].forEach((z, i) => {
        items.push(<StreetLamp key={`lw${i}`} p={[WX + SW_OFF + 0.8, 0.2, z]} r={Math.PI} />);
        items.push(<StreetLamp key={`le${i}`} p={[EX - SW_OFF - 0.8, 0.2, z]} r={0} />);
    });
    // Hidran & tempat sampah
    [[-30, SZ + SW_OFF - 0.9], [20, SZ + SW_OFF - 0.9], [-12, NZ - SW_OFF + 0.6], [32, NZ - SW_OFF + 0.6]].forEach(([x, z], i) =>
        items.push(<Hydrant key={`h${i}`} p={[x, 0.2, z]} />)
    );
    [[-17, SZ - SW_OFF - 0.7], [17, SZ - SW_OFF - 0.7], [WX + SW_OFF + 0.7, -8], [EX - SW_OFF - 0.7, -8]].forEach(([x, z], i) =>
        items.push(<TrashBin key={`t${i}`} p={[x, 0.2, z]} c={i % 2 ? '#2563eb' : '#15803d'} />)
    );
    // Tiang listrik di tepi luar trotoar selatan (berkabel)
    const poleZ = SZ + LOT_EDGE - 0.3;
    const poleXs = [-42, -28, -14, 14, 28, 42];
    poleXs.forEach((x, i) => items.push(<PowerPole key={`pp${i}`} p={[x, 0, poleZ]} trafo={i === 2} />));
    items.push(<Box key="w1" p={[-28, 6.6, poleZ - 0.5]} s={[28, 0.03, 0.03]} c="#18181b" />);
    items.push(<Box key="w2" p={[-28, 6.45, poleZ + 0.5]} s={[28, 0.03, 0.03]} c="#18181b" />);
    items.push(<Box key="w3" p={[28, 6.6, poleZ - 0.5]} s={[28, 0.03, 0.03]} c="#18181b" />);
    items.push(<Box key="w4" p={[28, 6.45, poleZ + 0.5]} s={[28, 0.03, 0.03]} c="#18181b" />);
    // Halte bus
    items.push(<BusStop key="bs1" p={[-8, 0.2, SZ - SW_OFF - 0.2]} r={0} />);
    items.push(<BusStop key="bs2" p={[EX + SW_OFF + 0.2, 0.2, 18]} r={-Math.PI / 2} />);
    return <group>{waterWest ? dryOnly(items, true).filter((el) => !['w1', 'w2'].includes(el.key)) : items}</group>;
}

/* ---------- Kavling per gaya ---------- */

const WALLS = ['#fde68a', '#bfdbfe', '#fecaca', '#d9f99d', '#e9d5ff', '#fed7aa', '#f5f5f4', '#a5f3fc'];
const ROOFS = ['#7f1d1d', '#1e3a8a', '#3f3f46', '#14532d', '#78350f', '#9a3412'];
const CARS = ['#ef4444', '#3b82f6', '#f8fafc', '#18181b', '#facc15', '#22c55e', '#a855f7', '#f97316'];
const SHUTTERS = ['#1e3a8a', '#14532d', '#7f1d1d', undefined];

function house(key, p, r, i, extra = {}) {
    return (
        <HouseLot
            key={key}
            p={p}
            r={r}
            seed={i}
            wall={WALLS[i % WALLS.length]}
            roof={ROOFS[(i * 3) % ROOFS.length]}
            shutter={SHUTTERS[i % SHUTTERS.length]}
            floors={i % 3 === 0 ? 2 : 1}
            car={i % 4 === 3 ? null : CARS[(i * 5) % CARS.length]}
            carKind={i % 3 === 1 ? 'suv' : i % 5 === 2 ? 'pickup' : 'sedan'}
            {...extra}
        />
    );
}

const SHOPS = [
    ['TOKO BUKU', '#2563eb', '#f8fafc'],
    ['KAFE KOPI', '#78350f', '#fef3c7'],
    ['APOTEK', '#16a34a', '#f0fdf4'],
    ['TOKO ROTI', '#db2777', '#fdf2f8'],
    ['MINIMARKET', '#dc2626', '#fefce8'],
    ['LAUNDRY', '#0891b2', '#ecfeff'],
    ['WARUNG MAKAN', '#ea580c', '#fff7ed'],
];

function SuburbLots({ waterWest }) {
    const southZ = SZ + LOT_EDGE + 7;
    const westX = WX - LOT_EDGE - 7;
    const northZ = NZ - LOT_EDGE - 7;
    const items = [];
    // Selatan: taman kota di tengah, rumah di kiri-kanan (menghadap utara)
    items.push(<PocketPark key="park" p={[0, 0, southZ]} r={Math.PI} d={14} />);
    [-29, -17, 17, 29].forEach((x, i) => items.push(house(`hs${i}`, [x, 0, southZ], Math.PI, i)));
    items.push(<Tree key="ts1" p={[-40, 0, southZ - 2]} scale={1.3} />);
    items.push(<Tree key="ts2" p={[40, 0, southZ - 2]} scale={1.3} leaf="#16a34a" />);
    items.push(<Bush key="bs1" p={[-40, 0, southZ + 3]} />);
    items.push(<Bush key="bs2" p={[40, 0, southZ + 3]} />);
    // Barat: rumah menghadap timur
    [-29, -17, -5, 7].forEach((z, i) => items.push(house(`hw${i}`, [westX, 0, z], Math.PI / 2, i + 4)));
    // Utara: lapangan basket + rumah (menghadap selatan)
    items.push(<BasketCourt key="court" p={[0, 0, northZ]} r={Math.PI / 2} />);
    [-38, -26, -14, 14, 26, 38].forEach((x, i) => items.push(house(`hn${i}`, [x, 0, northZ], 0, i + 8)));
    return <group>{dryOnly(items, waterWest)}</group>;
}

function CityLots({ waterWest }) {
    const southZ = SZ + LOT_EDGE + 5.5;
    const westX = WX - LOT_EDGE - 5.5;
    const northZ = NZ - LOT_EDGE - 6;
    const items = [];
    [-36, -24, -12, 0, 12, 24, 36].forEach((x, i) => {
        const [sign, accent, wall] = SHOPS[i % SHOPS.length];
        items.push(<Shop key={`ss${i}`} p={[x, 0, southZ]} r={Math.PI} sign={sign} accent={accent} c={wall} floors={i % 2 ? 2 : 1} />);
    });
    [-29, -16, -3, 10].forEach((z, i) =>
        items.push(<Apartment key={`aw${i}`} p={[westX, 0, z]} r={Math.PI / 2} floors={4 + (i % 3)} c={WALLS[(i + 2) % WALLS.length]} accent={ROOFS[i % ROOFS.length]} />)
    );
    [-36, -22, -8, 8, 22, 36].forEach((x, i) =>
        items.push(<Apartment key={`an${i}`} p={[x, 0, northZ]} r={0} floors={5 + (i % 3)} w={11} c={WALLS[(i + 5) % WALLS.length]} accent={ROOFS[(i + 2) % ROOFS.length]} />)
    );
    return <group>{dryOnly(items, waterWest)}</group>;
}

/** Fasilitas umum sisi timur (menghadap barat ke jalan). */
function CivicLots({ city }) {
    const x = EX + LOT_EDGE + 7;
    return (
        <group>
            {city ? <PoliceStation p={[x, 0, -27]} r={-Math.PI / 2} /> : <FireStation p={[x, 0, -27]} r={-Math.PI / 2} />}
            <Clinic p={[x, 0, -11]} r={-Math.PI / 2} />
            <GasStation p={[x, 0, 6]} r={-Math.PI / 2} />
        </group>
    );
}

function RuralLots() {
    const items = [];
    const southZ = SZ + 9;
    [-36, -22, -8, 8, 22, 36].forEach((x, i) => items.push(<RiceField key={`rf${i}`} p={[x, 0, southZ]} w={12.5} d={10} ripe={i % 3 === 1} />));
    items.push(<Saung key="sa1" p={[-15, 0, southZ + 7]} r={Math.PI} />);
    items.push(<Saung key="sa2" p={[29, 0, southZ + 7]} r={Math.PI} />);
    [-29, -15, -1, 13].forEach((z, i) => items.push(<KampungHouse key={`kw${i}`} p={[WX - 10, 0, z]} r={Math.PI / 2} wall={i % 2 ? '#d6b37a' : '#c8a46a'} />));
    [-25, 0].forEach((z, i) => items.push(<KampungHouse key={`ke${i}`} p={[EX + 10, 0, z]} r={-Math.PI / 2} />));
    [12, 18].forEach((z, i) => items.push(<RiceField key={`rfe${i}`} p={[EX + 10, 0, z + 2]} w={11} d={5.6} ripe={i === 0} />));
    // Sungai di utara dengan jembatan bambu
    items.push(<Box key="river" p={[0, 0.04, NZ - 10]} s={[2 * E, 0.08, 6]} c="#38bdf8" rough={0.1} metal={0.2} />);
    items.push(<Box key="bank1" p={[0, 0.06, NZ - 6.8]} s={[2 * E, 0.12, 0.6]} c="#a16207" />);
    items.push(<Box key="bank2" p={[0, 0.06, NZ - 13.2]} s={[2 * E, 0.12, 0.6]} c="#a16207" />);
    [-20, 20].forEach((x, k) =>
        items.push(
            <group key={`br${k}`} position={[x, 0, NZ - 10]}>
                <Box p={[0, 0.5, 0]} s={[2.4, 0.15, 8]} c="#ca8a04" />
                {[-1.1, 1.1].map((bx) => (
                    <Box key={bx} p={[bx, 1.1, 0]} s={[0.08, 0.08, 8]} c="#a16207" />
                ))}
            </group>
        )
    );
    // Rumpun bambu & pisang di sepanjang jalan
    const rand = rng(77);
    for (let i = 0; i < 18; i += 1) {
        const x = -44 + rand() * 88;
        items.push(<BambooClump key={`bb${i}`} p={[x, 0, NZ - 18 - rand() * 8]} scale={0.8 + rand() * 0.5} />);
    }
    for (let i = 0; i < 10; i += 1) {
        items.push(<BananaTree key={`bn${i}`} p={[WX - 4 - rand() * 2, 0, -34 + i * 5.6]} scale={0.9 + rand() * 0.3} />);
    }
    return <group>{items}</group>;
}

/** Sabuk pepohonan & bebatuan di luar batas jelajah. */
function TreeBelt({ rural, waterWest }) {
    const items = [];
    const rand = rng(rural ? 991 : 123);
    const place = (x, z, i) => {
        // Jangan menanam pohon di atas jalan lingkar.
        if (waterWest && x < WATER_X) return;
        if (Math.abs(x - WX) < 7 || Math.abs(x - EX) < 7 || Math.abs(z - SZ) < 7 || Math.abs(z - NZ) < 7) return;
        const k = rand();
        if (rural && k < 0.35) items.push(<BambooClump key={`b${i}`} p={[x, 0, z]} scale={0.9 + rand() * 0.4} />);
        else if (k < 0.55) items.push(<PineTree key={`p${i}`} p={[x, 0, z]} scale={1.1 + rand() * 0.7} />);
        else if (k < 0.65 && !rural) items.push(<PalmTree key={`pa${i}`} p={[x, 0, z]} scale={1 + rand() * 0.4} />);
        else items.push(<Tree key={`t${i}`} p={[x, 0, z]} scale={1.2 + rand() * 0.8} leaf={k > 0.85 ? '#15803d' : k > 0.75 ? '#4ade80' : '#22c55e'} />);
        if (rand() < 0.3) items.push(<Rock key={`r${i}`} p={[x + 2, 0.2, z + 1]} scale={0.6 + rand()} />);
    };
    let i = 0;
    for (let x = -92; x <= 92; x += 6.5) {
        place(x + rand() * 3, 56 + rand() * 10, i++);
        place(x + rand() * 3, -66 - rand() * 12, i++);
    }
    for (let z = -60; z <= 52; z += 7) {
        place(-74 - rand() * 14, z + rand() * 3, i++);
        place(74 + rand() * 14, z + rand() * 3, i++);
    }
    return <group>{items}</group>;
}

/** Monumen "Selamat Datang" di sudut tenggara, menghadap persimpangan. */
function WelcomeSign({ townName }) {
    if (!townName) return null;
    return (
        <group position={[EX + 13, 0, SZ + 13]} rotation={[0, -Math.PI * 0.75, 0]}>
            <Box p={[0, 0.4, 0]} s={[9, 0.8, 2.4]} c="#a8a29e" />
            <Box p={[0, 2.0, 0]} s={[8, 2.6, 0.8]} c="#f5f5f4" />
            <SignBoard p={[0, 2.0, 0.45]} text={`SELAMAT DATANG\n${townName}`} size={[7.4, 2.2]} bg="#0f766e" fg="#ffffff" font="bold 58px sans-serif" />
            <Bush p={[-3.6, 0.8, 1]} scale={0.8} c="#16a34a" />
            <Bush p={[3.6, 0.8, 1]} scale={0.8} c="#16a34a" />
        </group>
    );
}

/** Pengisi sudut-sudut di luar persimpangan. */
function CornerFill({ style, waterWest }) {
    if (style === 'rural') {
        return (
            <group>
                <Saung p={[EX + 12, 0, SZ + 12]} r={-Math.PI * 0.75} />
                <BambooClump p={[WX - 12, 0, NZ - 12]} scale={1.2} />
            </group>
        );
    }
    const city = style === 'city';
    return (
        <group>
            {!waterWest && <Apartment p={[WX - 15, 0, SZ + 14]} r={Math.PI * 0.75} floors={city ? 8 : 4} c="#fef3c7" accent="#b45309" />}
            {!waterWest && <Apartment p={[WX - 15, 0, NZ - 15]} r={Math.PI / 4} floors={city ? 9 : 4} c="#e0f2fe" accent="#0369a1" />}
            <Apartment p={[EX + 15, 0, NZ - 15]} r={-Math.PI / 4} floors={city ? 7 : 3} c="#fce7f3" accent="#be185d" />
        </group>
    );
}

/* ---------- Lapisan beranimasi: lalu lintas & warga ---------- */

const LANES = [
    // [sumbu, koordinat tetap, arah (+1/-1), jumlah mobil]
    ['x', SZ - 2, 1, 2],
    ['x', SZ + 2, -1, 2],
    ['x', NZ - 2, 1, 1],
    ['x', NZ + 2, -1, 1],
    ['z', WX - 2, -1, 1],
    ['z', WX + 2, 1, 1],
    ['z', EX - 2, -1, 1],
    ['z', EX + 2, 1, 1],
];

/**
 * Satu lajur lalu lintas (lajur kiri, sesuai aturan jalan di Indonesia).
 * Mobil melambat & berhenti bila pemain berada di depannya, dan menjaga jarak dengan mobil di depan.
 */
function TrafficLane({ axis, fixed, dir, count, seed, playerRef, withBus, minS = -E }) {
    const refs = useRef([]);
    const state = useMemo(() => {
        const len = E - minS;
        return Array.from({ length: count }).map((_, i) => ({ s: minS + ((i / count) * len + seed * 17) % len, v: 7 }));
    }, [count, seed, minS]);
    const cruise = 7.5;

    useFrame((_, dt) => {
        const d = Math.min(dt, 0.05);
        const pl = playerRef?.current?.position;
        state.forEach((car, i) => {
            const px = pl ? (axis === 'x' ? pl.x : pl.z) : 1e9;
            const lat = pl ? Math.abs((axis === 'x' ? pl.z : pl.x) - fixed) : 1e9;
            const aheadPlayer = (px - car.s) * dir;
            let target = cruise;
            if (lat < 2.2 && aheadPlayer > 0 && aheadPlayer < 7) target = 0;
            state.forEach((o, j) => {
                if (j === i) return;
                const gap = (o.s - car.s) * dir;
                if (gap > 0 && gap < 9.5) target = Math.min(target, o.v * 0.9);
            });
            car.v += (target - car.v) * Math.min(1, d * 3);
            car.s += car.v * dir * d;
            if (car.s > E) car.s = minS;
            if (car.s < minS) car.s = E;
            const g = refs.current[i];
            if (g) {
                if (axis === 'x') g.position.set(car.s, 0, fixed);
                else g.position.set(fixed, 0, car.s);
            }
        });
    });

    const rot = axis === 'x' ? (dir > 0 ? 0 : Math.PI) : dir > 0 ? -Math.PI / 2 : Math.PI / 2;
    return (
        <group>
            {state.map((_, i) => (
                <group key={i} ref={(el) => (refs.current[i] = el)} rotation={[0, rot, 0]}>
                    {/* Mesh tiap kendaraan digabung agar hemat draw call; tetap ikut bergerak bersama grupnya. */}
                    <StaticBatch>
                    {withBus && i === 0 ? (
                        <group>
                            <Box p={[0, 1.6, 0]} s={[8, 2.6, 2.3]} c="#0ea5e9" rough={0.4} />
                            <Box p={[0.2, 2.1, 0]} s={[7.2, 0.9, 2.34]} c="#1e293b" rough={0.1} metal={0.5} />
                            <Box p={[0, 3.0, 0]} s={[7.6, 0.2, 2.2]} c="#f8fafc" />
                            <Box p={[4.02, 1.1, 0]} s={[0.06, 0.4, 1.8]} c="#fef9c3" emissive="#fde047" ei={0.8} />
                            {[-2.6, 2.6].map((x) => [1, -1].map((z) => <Box key={`${x}${z}`} p={[x, 0.45, z * 1.1]} s={[0.9, 0.9, 0.3]} c="#111827" />))}
                        </group>
                    ) : (
                        <CarBody c={CARS[(seed * 3 + i * 5) % CARS.length]} kind={['sedan', 'suv', 'pickup'][(seed + i) % 3]} />
                    )}
                    </StaticBatch>
                </group>
            ))}
        </group>
    );
}

/** Warga berjalan bolak-balik di trotoar. */
function Walker({ from, to, speed = 1.6, preset = 'siswa', hair = 'short', phase = 0 }) {
    const ref = useRef();
    const t = useRef(phase);
    const dx = to[0] - from[0];
    const dz = to[2] - from[2];
    const len = Math.hypot(dx, dz);
    useFrame((_, dt) => {
        if (!ref.current) return;
        t.current = (t.current + (Math.min(dt, 0.05) * speed) / len) % 2;
        const forward = t.current < 1;
        const k = forward ? t.current : 2 - t.current;
        ref.current.position.set(from[0] + dx * k, 0.2, from[2] + dz * k);
        ref.current.rotation.y = Math.atan2(forward ? dx : -dx, forward ? dz : -dz);
    });
    return (
        <group ref={ref} position={from}>
            <RobloxCharacter isMoving batikPreset={preset} hairStyle={hair} showNameTag={false} />
        </group>
    );
}

function Pedestrians({ waterWest }) {
    return (
        <group>
            <Walker from={[waterWest ? -28 : -40, 0, SZ - SW_OFF + 0.4]} to={[-12, 0, SZ - SW_OFF + 0.4]} preset="guru" hair="peci" phase={0.3} />
            <Walker from={[6, 0, SZ + SW_OFF + 0.2]} to={[42, 0, SZ + SW_OFF + 0.2]} preset="duta" phase={1.2} />
            {!waterWest && <Walker from={[WX + SW_OFF - 0.5, 0, -32]} to={[WX + SW_OFF - 0.5, 0, 18]} preset="siswa" phase={0.7} speed={1.9} />}
        </group>
    );
}

/* ---------- Komponen utama ---------- */

export default function Town({ style = 'suburb', townName, playerRef, waterWest = false }) {
    const rural = style === 'rural';
    const city = style === 'city';
    return (
        <group>
            <StaticBatch registerBlockers>
                <RoadNetwork rural={rural} waterWest={waterWest} />
                {!rural && <StreetFurniture waterWest={waterWest} />}
                {rural ? <RuralLots /> : city ? <CityLots waterWest={waterWest} /> : <SuburbLots waterWest={waterWest} />}
                {!rural && <CivicLots city={city} />}
                <CornerFill style={style} waterWest={waterWest} />
                <TreeBelt rural={rural} waterWest={waterWest} />
                <WelcomeSign townName={townName} />
            </StaticBatch>

            {!rural &&
                LANES.map(([axis, fixed, dir, count], i) => {
                    if (waterWest && axis === 'z' && fixed < 0) return null;
                    return (
                    <TrafficLane
                        key={i}
                        axis={axis}
                        fixed={fixed}
                        dir={dir}
                        count={city && i < 2 ? count + 1 : count}
                        seed={i + 1}
                        playerRef={playerRef}
                        withBus={city && i === 0}
                        minS={waterWest && axis === 'x' ? WATER_X : -E}
                    />
                    );
                })}
            {!rural && <Pedestrians waterWest={waterWest} />}
        </group>
    );
}
