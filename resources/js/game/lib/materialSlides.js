/*
 * materialSlides — memecah konten materi (HTML dari guru/DB) menjadi langkah percakapan NPC.
 *
 * Aturan pemecahan:
 *  - <h1>-<h4>        → penanda bagian (judul topik) untuk langkah berikutnya.
 *  - <p> panjang      → dipecah per kalimat menjadi potongan ±260 karakter.
 *  - <ul>/<ol>        → dipecah per 2–3 butir agar tidak terlalu padat.
 *  - elemen lain      → satu langkah utuh (tabel, kutipan, dsb.).
 * Konten tetap berasal dari database (aturan emas #5); tidak ada teks materi yang dikarang di sini.
 */

const MAX_CHARS = 260;

const PLAYER_REPLIES = ['Oke, lanjut!', 'Paham, Kak!', 'Lalu bagaimana?', 'Menarik! Terus?', 'Siap, lanjutkan!', 'Saya catat. Berikutnya?'];

function splitSentences(html, text) {
    if (text.length <= MAX_CHARS) return [html];
    // Pecah teks polos per kalimat; format inline hilang hanya pada paragraf yang sangat panjang.
    const sentences = text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [text];
    const chunks = [];
    let cur = '';
    sentences.forEach((s) => {
        if ((cur + s).length > MAX_CHARS && cur) {
            chunks.push(cur.trim());
            cur = '';
        }
        cur += s;
    });
    if (cur.trim()) chunks.push(cur.trim());
    return chunks.map((c) => `<p>${escapeHtml(c)}</p>`);
}

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function listChunks(el) {
    const items = [...el.children].filter((c) => c.tagName === 'LI');
    const tag = el.tagName.toLowerCase();
    const out = [];
    let group = [];
    let len = 0;
    items.forEach((li) => {
        const l = li.textContent.length;
        if (group.length && (group.length >= 3 || len + l > MAX_CHARS + 80)) {
            out.push(group);
            group = [];
            len = 0;
        }
        group.push(li.outerHTML);
        len += l;
    });
    if (group.length) out.push(group);
    return out.map((g, i) => {
        const start = tag === 'ol' ? ` start="${1 + out.slice(0, i).reduce((a, b) => a + b.length, 0)}"` : '';
        return `<${tag}${start}>${g.join('')}</${tag}>`;
    });
}

/**
 * @returns {{ steps: Array<{ html: string, section: string|null, reply: string }>, sections: string[] }}
 */
export function buildMaterialSteps(contentHtml) {
    const doc = new DOMParser().parseFromString(`<div>${contentHtml || ''}</div>`, 'text/html');
    const root = doc.body.firstElementChild;
    const steps = [];
    const sections = [];
    let section = null;
    let sectionAnnounced = false;

    const push = (html) => {
        steps.push({ html, section: sectionAnnounced ? null : section, reply: '' });
        sectionAnnounced = true;
    };

    root.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
            const t = node.textContent.trim();
            if (t) splitSentences(escapeHtml(t), t).forEach(push);
            return;
        }
        if (node.nodeType !== 1) return;
        const tag = node.tagName;
        if (/^H[1-6]$/.test(tag)) {
            if (section && !sectionAnnounced) push(`<p><strong>${escapeHtml(section)}</strong></p>`);
            section = node.textContent.trim();
            sections.push(section);
            sectionAnnounced = false;
            return;
        }
        if (tag === 'P') {
            const t = node.textContent.trim();
            if (!t) return;
            splitSentences(node.outerHTML, t).forEach(push);
            return;
        }
        if (tag === 'UL' || tag === 'OL') {
            listChunks(node).forEach(push);
            return;
        }
        if (node.textContent.trim() || node.querySelector('img,table')) push(node.outerHTML);
    });
    if (section && !sectionAnnounced) push(`<p><strong>${escapeHtml(section)}</strong></p>`);

    steps.forEach((s, i) => {
        s.reply = i === steps.length - 1 ? 'Saya sudah paham semuanya!' : PLAYER_REPLIES[i % PLAYER_REPLIES.length];
    });
    return { steps, sections };
}
