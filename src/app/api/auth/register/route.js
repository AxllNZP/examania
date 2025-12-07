// src/app/api/auth/register/route.js

import { cookies } from "next/headers";
import { addUser, findUserByEmail } from "../../../../../lib/users";
import { generateAccessToken, generateRefreshToken } from "../../../../../lib/auth";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // ========================================
    // PASO 1: VALIDAR CAMPOS REQUERIDOS
    // ========================================
    
    if (!name || !name.trim()) {
      return new Response(
        JSON.stringify({ error: "El nombre es requerido" }),
        { status: 400 }
      );
    }

    if (name.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "El nombre debe tener al menos 3 caracteres" }),
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: "El email es requerido" }),
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "El email no es válido" }),
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return new Response(
        JSON.stringify({ error: "La contraseña es requerida" }),
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "La contraseña debe tener al menos 6 caracteres" }),
        { status: 400 }
      );
    }

    // ========================================
    // PASO 2: VERIFICAR EN BASE DE DATOS
    // ========================================
    
    const existingUser = await findUserByEmail(email);
    
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Este email ya está registrado" }),
        { status: 409 }
      );
    }

    // ========================================
    // PASO 3: CREAR USUARIO EN BASE DE DATOS
    // ========================================
    
    const newUser = await addUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password, // En producción: hashear con bcrypt
      role: 'TEACHER' // Default: profesor
    });

    if (!newUser) {
      return new Response(
        JSON.stringify({ error: "Error al crear el usuario" }),
        { status: 500 }
      );
    }

    console.log("✅ Nuevo usuario creado:", {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

    // ========================================
    // PASO 4: GENERAR TOKENS
    // ========================================
    
    const payload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    console.log("🔑 Tokens generados para usuario:", newUser.email);

    // ========================================
    // PASO 5: GUARDAR TOKENS EN COOKIES
    // ========================================
    
    const cookieStore = await cookies();
    
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15,
      path: "/"
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    console.log("🍪 Cookies guardadas correctamente");

    // ========================================
    // PASO 6: RESPONDER CON ÉXITO
    // ========================================
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Usuario registrado exitosamente",
        user: { 
          id: newUser.id, 
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      }),
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error("❌ Error en registro:", error);
    return new Response(
      JSON.stringify({ error: "Error en el servidor" }),
      { status: 500 }
    );
  }
}