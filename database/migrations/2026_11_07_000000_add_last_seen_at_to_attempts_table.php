<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /*
     * last_seen_at = detak terakhir dari layar ujian siswa (heartbeat tiap ±10 detik).
     * Dipakai untuk mendeteksi siswa yang menutup jendela/tab saat ujian berlangsung.
     */
    public function up(): void
    {
        Schema::table('attempts', function (Blueprint $table) {
            $table->timestamp('last_seen_at')->nullable()->after('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('attempts', function (Blueprint $table) {
            $table->dropColumn('last_seen_at');
        });
    }
};
