import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import RouteGuard from './components/layout/RouteGuard';

const GameRoot = lazy(() => import('./game/GameRoot'));
const TeacherDashboardPage = lazy(() => import('./pages/TeacherDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const TeacherProfilePage = lazy(() => import('./pages/TeacherProfilePage'));

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-slate-300">Memuat dunia 3D BAHASA PLAY.AI...</p>
        </div>
    );
}

function PanelFallback() {
    return (
        <div className="min-h-screen bg-banten-night text-slate-100 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-banten-gold border-t-transparent animate-spin" />
            <p className="font-game text-lg text-white">Memuat panel...</p>
        </div>
    );
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/profil-guru',
        element: (
            <Suspense fallback={<PanelFallback />}>
                <TeacherProfilePage />
            </Suspense>
        ),
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/student/chapters/:chapterId/play',
        element: (
            <RouteGuard allowedRoles={['student', 'teacher', 'admin']}>
                <Suspense fallback={<LoadingFallback />}>
                    <GameRoot />
                </Suspense>
            </RouteGuard>
        ),
    },
    {
        path: '/student/*',
        element: (
            <RouteGuard allowedRoles={['student', 'teacher', 'admin']}>
                <StudentDashboardPage />
            </RouteGuard>
        ),
    },
    {
        path: '/teacher/*',
        element: (
            <RouteGuard allowedRoles={['teacher', 'admin']}>
                <Suspense fallback={<PanelFallback />}>
                    <TeacherDashboardPage />
                </Suspense>
            </RouteGuard>
        ),
    },
    {
        path: '/admin/*',
        element: (
            <RouteGuard allowedRoles={['admin']}>
                <Suspense fallback={<PanelFallback />}>
                    <AdminDashboardPage />
                </Suspense>
            </RouteGuard>
        ),
    },
    {
        path: '*',
        element: <LandingPage />,
    },
]);
