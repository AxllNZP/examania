import { users } from "lib/users";
import jwt from "jsonwebtoken";

export async function POST(req) {
  const { email, password } = await req.json();

  const user = users.find(u => u.email === email && u.password === password);

  if (!email) return setError("El correo es requerido");
  if (!password) return setError("La contraseña es requerida");

  if (!user) {
    return new Response(
      JSON.stringify({ error: "El usuario o Contraseña son Incorrectos" }),
      { status: 401 }
    );
  }

  const token = jwt.sign({ id: user.id }, "SECRET_KEY", { expiresIn: "1d" });

  return new Response(JSON.stringify({ token }), { status: 200 });
}
