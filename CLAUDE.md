# CLAUDE.md — BAHASA PLAY

@AGENTS.md
@docs/PROGRESS.md

## Catatan khusus Claude Code

- Semua aturan proyek ada di `AGENTS.md` (sudah diimpor di atas). Ikuti sepenuhnya.
- Untuk tugas besar, gunakan **plan mode** (Shift+Tab) dulu, tunjukkan rencana, baru eksekusi.
- Perintah kustom proyek ada di `.claude/commands/`:
  - `/lanjut` — lanjutkan pekerjaan dari PROGRESS.md
  - `/fase <nomor>` — mulai fase tertentu dari ROADMAP.md
  - `/cek` — review & uji hasil kerja sebelum commit
  - `/simpan` — perbarui PROGRESS.md dan siapkan pesan commit
- Lingkungan pemilik: Windows + XAMPP. Saat memberi perintah terminal, utamakan yang kompatibel
  dengan PowerShell / terminal VS Code di Windows.
- Gunakan `/compact` saat percakapan panjang; sebelum itu pastikan PROGRESS.md sudah diperbarui.
