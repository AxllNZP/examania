// lib/users.js

// Simulación de base de datos
export let users = [
  {
    id: 1,
    name: "Administrador",
    email: "admin@examania.com",
    password: "123456", // En producción esto debe estar hasheado
    createdAt: new Date().toISOString()
  }
];

// Función para agregar un nuevo usuario
export function addUser(userData) {
  const newUser = {
    id: users.length + 1,
    name: userData.name,
    email: userData.email,
    password: userData.password, // En producción: hashear con bcrypt
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  return newUser;
}

// Función para buscar usuario por email
export function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

// Función para buscar usuario por ID
export function findUserById(id) {
  return users.find(u => u.id === id);
}

// Nota: En producción real, esto sería una base de datos (MySQL, PostgreSQL, MongoDB, etc.)