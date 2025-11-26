// En un nuevo archivo: components/auth/SessionExpiredPage.tsx

import { Card } from '@/components/ui/card';

export default function SessionExpired() {

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="p-8 text-center shadow-lg border-red-500">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Tu sesión ha expirado ⌛
        </h1>
        <p className="text-gray-600">
          Por tu seguridad, hemos cerrado tu sesión. Podés ingresar de nuevo desde ECONET o desde la ventana de Login.
        </p>
      </Card>
    </div>
  );
}