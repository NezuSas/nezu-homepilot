import { AuthLayout } from "../components/AuthLayout";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
  return (
    <AuthLayout
      title="Crear una cuenta"
      description="Regístrate para comenzar a controlar tu hogar inteligente"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
