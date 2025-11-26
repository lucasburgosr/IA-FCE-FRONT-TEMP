import React from 'react'
import { Navigate, BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ProtectedRoute from './ProtectedRoute'
import Home from '@/pages/Home'
import Layout from './Layout'
import { Alumnos } from '@/pages/Alumnos'
import AsistenteEdit from '@/pages/Asistente'
import { Curso } from '@/pages/Curso'
import Resultados from '@/pages/Resultados'
import AuthHandler from '@/pages/AuthHandler'
import Logout from '@/pages/Logout'
import SessionExpired from '@/pages/SessionExpired'
import Login from '@/pages/Login'
import SignUpPage from '@/pages/SignUp'
import Responses from '@/pages/Responses'

const AppRouter: React.FC = () => {

    return (
        <Router>
            <Routes>
                {/* En la versión actual el login se va a realizar vía ECONET */}
                <Route path='/login' element={<Login />}></Route>
                <Route path='/registro' element={<SignUpPage />}></Route>
                <Route path='/auth-econet' element={<AuthHandler />}></Route>
                <Route path='/logout' element={<Logout />}></Route>
                <Route path='/sesion-expirada' element={<SessionExpired />}></Route>
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path='/chat' element={<Home />}></Route>
                    </Route>
                    <Route element={<Layout />}>
                        <Route path='/alumnos' element={<Alumnos />}></Route>
                    </Route>
                    <Route element={<Layout />}>
                        <Route path='/asistente' element={<AsistenteEdit />}></Route>
                    </Route>
                    <Route element={<Layout />}>
                        <Route path='/curso' element={<Curso />}></Route>
                    </Route>
                    <Route element={<Layout />}>
                        <Route path='/resultados' element={<Resultados />}></Route>
                    </Route>
                    <Route element={<Layout />}>
                        <Route path='/responses' element={<Responses />}></Route>
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    )
}

export default AppRouter