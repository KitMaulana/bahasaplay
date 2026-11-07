<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/*
 * Respons API berisi data pribadi per pengguna (progres, nilai, sesi ujian).
 * Header ini mencegah browser, proxy, CDN, atau cache server hosting (mis. LiteSpeed)
 * menyimpan respons milik satu akun lalu menampilkannya ke perangkat/akun lain.
 */
class NoStoreApiResponses
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');
        $response->headers->set('Vary', 'Authorization, Cookie, Accept-Encoding');
        // Beberapa cache hosting mengabaikan Cache-Control; header ini khusus LiteSpeed.
        $response->headers->set('X-LiteSpeed-Cache-Control', 'no-cache');

        return $response;
    }
}
