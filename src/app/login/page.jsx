// src/app/login/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';

// Importa el esquema de validación (Zod)
// Ajusta la ruta si tu validation.js está en otra carpeta
import { loginSchema } from '../../../lib/validation';

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Limpiar error de un campo cuando escribes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name] || errors.general) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: ''
      }));
    }
  };

  // Manejar submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setErrors({ email: '', password: '', general: '' });

    // === Validación cliente usando Zod ===
    try {
      const parsed = loginSchema.safeParse(formData);
      if (!parsed.success) {
        // parsed.error.flatten() da estructura { formErrors, fieldErrors, ... }
        const fieldErrors = parsed.error.flatten().fieldErrors || {};
        setErrors({
          email: (fieldErrors.email && fieldErrors.email[0]) || '',
          password: (fieldErrors.password && fieldErrors.password[0]) || '',
          general: ''
        });
        return;
      }
    } catch (zErr) {
      // improbable, pero prevenir crash
      console.error("Error validación cliente:", zErr);
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.status === 400) {
        // Validación del servidor: puede devolver fieldErrors
        // Esperamos { errors: { fieldErrors: { email: [...], password: [...] } } }
        const fieldErrors = data?.errors?.fieldErrors || data?.errors || {};
        setErrors({
          email: (fieldErrors.email && fieldErrors.email[0]) || '',
          password: (fieldErrors.password && fieldErrors.password[0]) || '',
          general: data?.error || data?.message || ''
        });
        return;
      }

      if (response.status === 401) {
        // Credenciales incorrectas -> mensaje genérico exacto requerido
        setErrors({
          email: '',
          password: '',
          general: data?.error || 'El usuario o Contraseña son Incorrectos'
        });
        return;
      }

      if (!response.ok) {
        setErrors({
          email: '',
          password: '',
          general: data?.error || 'Error al conectar con el servidor'
        });
        return;
      }

      // Login exitoso: backend ya guardó cookies (accessToken & refreshToken)
      // Puedes usar router.push para redirigir al Inicio ("/" o "/dashboard")
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error("Fetch error:", err);
      setErrors({
        email: '',
        password: '',
        general: 'Error al conectar con el servidor'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Examania</h1>
          <p className="text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Usuario/Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors placeholder:text-cyan-600 placeholder:font-medium ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="Ingresa tu usuario"
              disabled={isLoading}
              autoComplete="username"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span>
                {errors.email}
              </p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors placeholder:text-cyan-600 placeholder:font-medium ${
                errors.password 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="Ingresa tu contraseña"
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span>
                {errors.password}
              </p>
            )}
          </div>

          {/* Error General (credenciales incorrectas) */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <span className="text-lg">❌</span>
                {errors.general}
              </p>
            </div>
          )}

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
              isLoading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Link a Registro */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Regístrate aquí
            </a>
          </p>
        </div>

        {/* Info de prueba */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            <strong>💡 Credenciales de prueba:</strong><br />
            Usuario: admin@examania.com<br />
            Contraseña: 123456
          </p>
        </div>
      </div>
    </div>
  );
}
