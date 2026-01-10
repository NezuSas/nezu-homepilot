import { AuthLayout } from "../components/AuthLayout";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      description="Ingresa tus credenciales para acceder a tu hogar"
    >
      <LoginForm />
    </AuthLayout>
  );
}
