import { NextResponse } from "next/server";
import { cookies } from "next/headers";

cookies().set("token", token, {
  httpOnly: true,
  sameSite: "strict",
  secure: true,
  path: "/"
});


export function middleware(req) {
  const token = req.cookies.get("token")?.value;

  const publicRoutes = ["/login"]; // rutas accesibles sin estar logueado
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

  // Caso 1: usuario NO logueado intenta acceder a rutas protegidas
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Caso 2: usuario logueado intenta entrar a /login
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("www.google.com", req.url));
  }

  return NextResponse.next();
}

// Qué rutas vigilar
export const config = {
  matcher: [
    "/((?!_next|static|favicon.ico|images).*)"
  ],
};

cookies().delete("token");
