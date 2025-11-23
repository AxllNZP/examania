// middleware.js (en la raíz del proyecto)

import { NextResponse } from "next/server";
import { verifyAccessToken, isTokenExpiringSoon } from "./lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Obtener tokens de las cookies
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // Rutas públicas (accesibles sin estar logueado)
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Rutas protegidas (requieren autenticación)
  const protectedRoutes = ["/dashboard", "/inicio", "/perfil"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // ========================================
  // CASO 1: USUARIO NO AUTENTICADO
  // ========================================
  
  if (!accessToken && !refreshToken) {
    // No tiene ningún token
    
    if (isProtectedRoute) {
      // Intenta acceder a ruta protegida → Redirigir a login
      console.log("❌ Sin tokens, redirigiendo a /login");
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Ruta pública → Permitir acceso
    return NextResponse.next();
  }

  // ========================================
  // CASO 2: VERIFICAR ACCESS TOKEN
  // ========================================
  
  let isAuthenticated = false;
  
  if (accessToken) {
    const decoded = verifyAccessToken(accessToken);
    
    if (decoded) {
      // Access token válido
      isAuthenticated = true;
      
      // ========================================
      // RENOVACIÓN AUTOMÁTICA DE TOKEN
      // ========================================
      
      // Si el token está por expirar (menos de 5 min)
      if (isTokenExpiringSoon(accessToken)) {
        console.log("⚠️ Access token expirando pronto, renovando...");
        
        try {
          // Llamar a la API de refresh
          const refreshResponse = await fetch(new URL("/api/auth/refresh", req.url), {
            method: "POST",
            headers: {
              Cookie: `refreshToken=${refreshToken}`
            }
          });
          
          if (refreshResponse.ok) {
            console.log("✅ Token renovado exitosamente");
            
            // Obtener el nuevo token de la respuesta
            const cookies = refreshResponse.headers.get("set-cookie");
            
            // Crear respuesta con el nuevo token
            const response = NextResponse.next();
            
            if (cookies) {
              // Copiar las cookies de la respuesta del refresh
              response.headers.set("set-cookie", cookies);
            }
            
            return response;
          } else {
            console.log("❌ Error al renovar token");
            // Si falla, continuar con el token actual
          }
        } catch (error) {
          console.error("❌ Error en renovación automática:", error);
        }
      }
    } else {
      // Access token inválido/expirado
      console.log("⚠️ Access token inválido");
      
      // Si tiene refresh token, intentar renovar
      if (refreshToken) {
        console.log("🔄 Intentando renovar con refresh token...");
        isAuthenticated = true; // Asumimos que tiene refresh válido
      }
    }
  } else if (refreshToken) {
    // No tiene access token pero sí refresh token
    console.log("🔄 Solo tiene refresh token, necesita renovar");
    isAuthenticated = true; // El refresh lo manejará la app
  }

  // ========================================
  // CASO 3: USUARIO AUTENTICADO EN RUTA PÚBLICA
  // ========================================
  
  if (isAuthenticated && isPublicRoute) {
    // Ya está logueado, no puede ver login/register
    console.log("✅ Usuario autenticado, redirigiendo a /dashboard");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ========================================
  // CASO 4: USUARIO NO AUTENTICADO EN RUTA PROTEGIDA
  // ========================================
  
  if (!isAuthenticated && isProtectedRoute) {
    console.log("❌ No autenticado, redirigiendo a /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ========================================
  // CASO 5: RUTA RAÍZ "/"
  // ========================================
  
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Permitir el acceso
  return NextResponse.next();
}

// Configurar qué rutas vigilar
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*|_next).*)",
  ],
};