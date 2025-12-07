// src/app/api/auth/refresh/route.js

import { cookies } from "next/headers";
import { verifyRefreshToken, generateAccessToken } from "../../../../../lib/auth";
import { findUserById } from "../../../../../lib/users";

export async function POST() {
  try {
    // ========================================
    // PASO 1: OBTENER EL REFRESH TOKEN
    // ========================================
    
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      console.log("❌ No se encontró refresh token");
      return new Response(
        JSON.stringify({ error: "No hay sesión activa" }),
        { status: 401 }
      );
    }

    // ========================================
    // PASO 2: VERIFICAR EL REFRESH TOKEN
    // ========================================
    
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      console.log("❌ Refresh token inválido o expirado");
      
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      
      return new Response(
        JSON.stringify({ error: "Sesión expirada, inicia sesión nuevamente" }),
        { status: 401 }
      );
    }

    console.log("✅ Refresh token válido para usuario:", decoded.email);

    // ========================================
    // PASO 3: BUSCAR USUARIO EN BASE DE DATOS
    // ========================================
    
    const user = await findUserById(decoded.id);

    if (!user) {
      console.log("❌ Usuario no encontrado en BD:", decoded.id);
      
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      
      return new Response(
        JSON.stringify({ error: "Usuario no encontrado" }),
        { status: 404 }
      );
    }

    // ========================================
    // PASO 4: GENERAR NUEVO ACCESS TOKEN
    // ========================================
    
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const newAccessToken = generateAccessToken(payload);

    console.log("🔄 Nuevo access token generado para:", user.email);

    // ========================================
    // PASO 5: ACTUALIZAR LA COOKIE
    // ========================================
    
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15,
      path: "/"
    });

    console.log("🍪 Cookie de access token actualizada");

    // ========================================
    // PASO 6: RESPONDER CON ÉXITO
    // ========================================
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Token renovado exitosamente",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Error en refresh token:", error);
    return new Response(
      JSON.stringify({ error: "Error al renovar token" }),
      { status: 500 }
    );
  }
}