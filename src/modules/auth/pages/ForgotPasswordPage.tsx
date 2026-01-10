import { AuthLayout } from "../components/AuthLayout";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recuperar contraseña"
      description="Ingresa tu correo electrónico para recibir las instrucciones de recuperación"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
