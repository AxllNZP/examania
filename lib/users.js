// lib/users.js

import prisma from './prisma';

/**
 * Buscar usuario por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Object|null>} Usuario o null
 */
export async function findUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim()
      }
    });
    return user;
  } catch (error) {
    console.error('Error buscando usuario por email:', error);
    return null;
  }
}

/**
 * Buscar usuario por ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object|null>} Usuario o null
 */
export async function findUserById(id) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    return user;
  } catch (error) {
    console.error('Error buscando usuario por ID:', error);
    return null;
  }
}

/**
 * Crear un nuevo usuario
 * @param {Object} userData - Datos del usuario {name, email, password, role?}
 * @returns {Promise<Object|null>} Usuario creado o null
 */
export async function addUser(userData) {
  try {
    const newUser = await prisma.user.create({
      data: {
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password, // En producción: hashear con bcrypt
        role: userData.role || 'TEACHER' // Default: TEACHER
      }
    });
    
    console.log('✅ Usuario creado:', newUser.email);
    return newUser;
  } catch (error) {
    console.error('Error creando usuario:', error);
    return null;
  }
}

/**
 * Obtener todos los usuarios
 * @returns {Promise<Array>} Lista de usuarios
 */
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return users;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }
}

/**
 * Actualizar usuario
 * @param {number} id - ID del usuario
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object|null>} Usuario actualizado o null
 */
export async function updateUser(id, data) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(id)
      },
      data: data
    });
    return updatedUser;
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return null;
  }
}

/**
 * Eliminar usuario
 * @param {number} id - ID del usuario
 * @returns {Promise<boolean>} true si se eliminó, false si hubo error
 */
export async function deleteUser(id) {
  try {
    await prisma.user.delete({
      where: {
        id: parseInt(id)
      }
    });
    return true;
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return false;
  }
}