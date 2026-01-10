import { AuthLayout } from "../components/AuthLayout";
import { ResetPasswordForm } from "../components/ResetPasswordForm";
import { Suspense } from "react";

export function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Nueva contraseña"
      description="Ingresa tu nueva contraseña para recuperar el acceso"
    >
      <Suspense fallback={<div>Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
