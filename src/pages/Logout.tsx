// En un nuevo archivo: components/auth/LogoutSuccessPage.tsx
import { Card } from '@/components/ui/card'; // Asumo que usas ShadCN

export default function Logout() {

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Sesión cerrada con éxito ✅
        </h1>
        <p className="text-gray-600">
          Podés volver a ingresar desde el curso en ECONET o desde la pantalla de Login.
        </p>
      </Card>
    </div>
  );
}