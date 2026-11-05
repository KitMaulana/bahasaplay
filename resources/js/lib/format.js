export function formatDateTime(value) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
    }).format(new Date(value));
}

export function formatScore(value) {
    if (value === null || value === undefined) return '-';
    return Number(value).toFixed(0);
}
