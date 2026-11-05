import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RouteGuard from './components/layout/RouteGuard';

const Lab3DPage = lazy(() => import('./pages/Lab3DPage'));
const GameRoot = lazy(() => import('./game/GameRoot'));

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-slate-300">Memuat lingkungan 3D BAHASA PLAY...</p>
        </div>
    );
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
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
                <TeacherDashboardPage />
            </RouteGuard>
        ),
    },
    {
        path: '/admin/*',
        element: (
            <RouteGuard allowedRoles={['admin']}>
                <AdminDashboardPage />
            </RouteGuard>
        ),
    },
    {
        path: '/lab',
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <Lab3DPage />
            </Suspense>
        ),
    },
    {
        path: '*',
        element: <LandingPage />,
    },
]);
