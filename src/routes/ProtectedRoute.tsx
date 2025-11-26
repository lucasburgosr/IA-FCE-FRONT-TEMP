import { Navigate, Outlet } from "react-router-dom"

const isAuthenticated = () => {
    const token = localStorage.getItem("token")
    return Boolean(token)
}

const ProtectedRoute: React.FC = () => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default ProtectedRoute