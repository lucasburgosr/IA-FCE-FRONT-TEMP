import './styles/App.css'
import AppRouter from './routes/AppRouter'
import axios from 'axios'
import { useAuthStore } from './store/authStore'

axios.interceptors.response.use(
  
  response => response,

  error => {
    if (error.response && error.response.status === 401) {
      
      if (window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/sesion-expirada')) {
        return Promise.reject(error);
      }

      console.warn("Token expirado o inválido. Cerrando sesión automáticamente.");
      
      localStorage.removeItem('token');
      useAuthStore.getState().clearAuth();
      
      window.location.href = '/sesion-expirada';
    }
    
    return Promise.reject(error);
  }
);

function App() {
  return (
      <AppRouter></AppRouter>
  )
}

export default App
