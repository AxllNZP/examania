// src/app/api/auth/login/route.js

import { findUserByEmail } from "../../../../../lib/users";
import { generateAccessToken, generateRefreshToken } from "../../../../../lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validar que se envíen los campos
    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: "El usuario es requerido" }),
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return new Response(
        JSON.stringify({ error: "La contraseña es requerida" }),
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = findUserByEmail(email);

    // Si no existe el usuario o la contraseña es incorrecta
    if (!user || user.password !== password) {
      return new Response(
        JSON.stringify({ error: "El usuario o Contraseña son Incorrectos" }),
        { status: 401 }
      );
    }

    // ========================================
    // GENERAR TOKENS (Access + Refresh)
    // ========================================
    
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    // Token de acceso (15 minutos)
    const accessToken = generateAccessToken(payload);
    
    // Token de refresco (7 días)
    const refreshToken = generateRefreshToken(payload);

    console.log("🔑 Login exitoso para:", user.email);

    // ========================================
    // GUARDAR TOKENS EN COOKIES
    // ========================================
    
    const cookieStore = await cookies();
    
    // Cookie del Access Token
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15, // 15 minutos
      path: "/"
    });

    // Cookie del Refresh Token
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/"
    });

    // Respuesta exitosa
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Login exitoso",
        user: { 
          id: user.id, 
          email: user.email,
          name: user.name 
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error en login:", error);
    return new Response(
      JSON.stringify({ error: "Error en el servidor" }),
      { status: 500 }
    );
  }
}