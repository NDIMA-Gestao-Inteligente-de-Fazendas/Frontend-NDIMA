import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../utils/auth';

/** Public-only routes — redirects authenticated users straight to /dashboard */
export default function PublicRoute() {
    return getToken() ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
