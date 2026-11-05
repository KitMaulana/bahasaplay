import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function RouteGuard({ allowedRoles = [], children }) {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const fallback =
            user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student';
        return <Navigate to={fallback} replace />;
    }

    return children;
}
