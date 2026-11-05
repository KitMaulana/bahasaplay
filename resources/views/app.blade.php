<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="theme-color" content="#0f172a">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="BAHASA PLAY">
    <meta name="description" content="BAHASA PLAY — Mainkan gamenya, pelajari bahasanya. Game-Based Learning Management System untuk Bahasa Indonesia SMA Kelas XII SMAN 1 Ciruas.">
    <title>{{ config('app.name', 'BAHASA PLAY') }}</title>
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="icon" type="image/svg+xml" href="/icons/icon-192.svg">
    <link rel="apple-touch-icon" href="/icons/icon-192.svg">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=plus-jakarta-sans:400,500,600,700,800&display=swap" rel="stylesheet" />
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body class="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
    <div id="app"></div>
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').catch(function () {});
            });
        }
    </script>
</body>
</html>
