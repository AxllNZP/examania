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

    // Validar formato de email
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
    // PASO 2: VERIFICAR QUE EL EMAIL NO EXISTA
    // ========================================
    
    const existingUser = findUserByEmail(email);
    
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Este email ya está registrado" }),
        { status: 409 } // 409 = Conflict
      );
    }

    // ========================================
    // PASO 3: CREAR NUEVO USUARIO
    // ========================================
    
    const newUser = addUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password // En producción: hashear con bcrypt
    });

    console.log("✅ Nuevo usuario creado:", {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    });

    // ========================================
    // PASO 4: GENERAR TOKENS (Access + Refresh)
    // ========================================
    
    const payload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    };

    // Token de acceso (15 minutos)
    const accessToken = generateAccessToken(payload);
    
    // Token de refresco (7 días)
    const refreshToken = generateRefreshToken(payload);

    console.log("🔑 Tokens generados para usuario:", newUser.email);

    // ========================================
    // PASO 5: GUARDAR TOKENS EN COOKIES
    // ========================================
    
    const cookieStore = await cookies();
    
    // Cookie del Access Token
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15, // 15 minutos en segundos
      path: "/"
    });

    // Cookie del Refresh Token
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días en segundos
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
          name: newUser.name 
        }
      }),
      { 
        status: 201, // 201 = Created
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