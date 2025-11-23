// src/app/api/logout/route.js

import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Eliminar la cookie del token
    cookieStore.delete("token");
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Logout exitoso" 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en logout:", error);
    return new Response(
      JSON.stringify({ error: "Error al cerrar sesión" }),
      { status: 500 }
    );
  }
}