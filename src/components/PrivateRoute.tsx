import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../utils/auth';

/** Protects routes that require authentication — redirects to /login if no token */
export default function PrivateRoute() {
    return getToken() ? <Outlet /> : <Navigate to="/login" replace />;
}
