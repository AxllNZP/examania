// lib/prisma.js

import { PrismaClient } from '@prisma/client';

// PrismaClient es adjuntado al objeto `global` en desarrollo para prevenir
// exhaustar el límite de conexiones de base de datos.

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'], // Opcional: ver las queries en consola
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;