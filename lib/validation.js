// src/lib/validation.js
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty("El correo es requerido")
    .email("El correo no es válido"),
  password: z
    .string()
    .nonempty("La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});
