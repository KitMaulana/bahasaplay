<?php

use App\Services\Assessment\AttemptService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('attempts:finalize-expired', function (AttemptService $attemptService) {
    $count = $attemptService->finalizeExpiredAttempts();
    $this->info("Berhasil memfinalisasi {$count} sesi ujian yang telah melewati batas waktu.");
})->purpose('Finalisasi otomatis sesi ujian yang sudah melewati batas waktu');

Schedule::command('attempts:finalize-expired')->everyMinute();
