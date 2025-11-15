import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function LoginPage() {
  const token = cookies().get("token");

  if (token) {
    redirect("/");
  }

  return (
    <div className="login-container">
      <h1>Iniciar Sesión</h1>
      
    </div>
  );
}
