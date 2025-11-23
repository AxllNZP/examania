// lib/auth.js

import jwt from "jsonwebtoken";

// Claves secretas (en producción deben estar en .env)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "ACCESS_SECRET_EXAMANIA_2024";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "REFRESH_SECRET_EXAMANIA_2024";

// Duraciones de los tokens
const ACCESS_TOKEN_EXPIRY = "15m";   // 15 minutos
const REFRESH_TOKEN_EXPIRY = "7d";   // 7 días

/**
 * Genera un Access Token (corta duración)
 * @param {Object} payload - Datos del usuario {id, email, name}
 * @returns {string} Token JWT
 */
export function generateAccessToken(payload) {
  return jwt.sign(
    payload,
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Genera un Refresh Token (larga duración)
 * @param {Object} payload - Datos del usuario {id, email}
 * @returns {string} Token JWT
 */
export function generateRefreshToken(payload) {
  return jwt.sign(
    { id: payload.id, email: payload.email }, // Solo datos esenciales
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Verifica si un Access Token es válido
 * @param {string} token - Token a verificar
 * @returns {Object|null} Payload decodificado o null si es inválido
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch {
    return null;
  }
}

/**
 * Verifica si un Refresh Token es válido
 * @param {string} token - Token a verificar
 * @returns {Object|null} Payload decodificado o null si es inválido
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch {
    return null;
  }
}

/**
 * Decodifica un token sin verificar (para ver su contenido)
 * @param {string} token - Token a decodificar
 * @returns {Object|null} Payload decodificado
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch{
    return null;
  }
}

/**
 * Verifica si un token está por expirar (menos de 5 minutos)
 * @param {string} token - Token a verificar
 * @returns {boolean} true si expira pronto
 */
export function isTokenExpiringSoon(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
  const currentTime = Date.now();
  const timeLeft = expirationTime - currentTime;
  
  // Si quedan menos de 5 minutos (300000 ms)
  return timeLeft < 300000;
}