import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export default function AuthHandler() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate();

  const login = useAuthStore(state => state.setAuth);

  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  console.log("Llega a este componente")

  useEffect(() => {

    const email = searchParams.get('email')
    const dni = searchParams.get('dni')
    const nombres = searchParams.get('nombres')
    const apellido = searchParams.get('apellido')
    const materia = searchParams.get('materia')
    const curso = searchParams.get("curso")

    const authenticate = async () => {
      if (!email || !dni || !nombres || !apellido) {
        setError("Faltan datos en la URL para la autenticación.");
        return;
      }

      try {
        const response = await axios.post(`${apiUrl}/auth/econet`, {
          email,
          dni,
          nombres,
          apellido,
          materia,
          curso
        });

        const { token, usuario_id, email_usuario, type } = response.data;

        if (token && usuario_id) {
          localStorage.setItem("token", token);
          login(token, email_usuario, usuario_id, type);

          if (type == "profesor") {
            navigate('/alumnos');
          } else {
            navigate('/chat')
          }
          
        } else {
          throw new Error("La respuesta del servidor no incluyó el token o el usuario.");
        }
      } catch (err) {
        console.error("Error durante la autenticación automática:", err);
        setError("No se pudo iniciar sesión. Por favor, intenta de nuevo desde Moodle.");
        // Opcional: Redirigir a una página de error o al login tradicional
        // navigate('/login?error=auth_failed');
      }
    };

    authenticate();
  }, [searchParams, navigate, login, apiUrl]);

  if (error) {
    return <div className="flex h-screen items-center justify-center">{error}</div>;
  }

  return <div className="flex h-screen items-center justify-center">Autenticando...</div>;
}