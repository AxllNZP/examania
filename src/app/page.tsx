"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    if (token) {
      document.cookie = `token=${token}; path=/;`;
      router.push("/dashboard");
    }
  }, [token, router]);

  const onSubmit = async (data) => {
    setServerError("");

    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify(data)
    });

    if (res.status === 401) {
      setServerError("El usuario o la contraseña son incorrectos");
      return;
    }

    const { token: responseToken } = await res.json();
    setToken(responseToken);
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f0f2f5"
    }}>
      <div style={{
        width: "350px",
        padding: "30px",
        borderRadius: "15px",
        background: "#008e98ff",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Bienvenido</h2>
        <p style={{ textAlign: "center", marginBottom: "20px", fontSize: "13px" }}>
          Tu ayudante personal
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>

          <label>Correo electrónico</label>
          <input
            {...register("email", { required: "El correo es requerido" })}
            style={inputStyle}
            type="email"
            placeholder="Ingresa tu correo"
          />
          {errors.email && <p style={errorStyle}>{errors.email.message}</p>}

          <label>Contraseña</label>
          <input
            {...register("password", { required: "La contraseña es requerida" })}
            style={inputStyle}
            type="password"
            placeholder="Ingresa tu contraseña"
          />
          {errors.password && <p style={errorStyle}>{errors.password.message}</p>}

          {serverError && <p style={errorStyle}>{serverError}</p>}

          <button type="submit" style={buttonStyle}>
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  background: "#2aa7e2",
  border: "none",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "15px"
};

const errorStyle = {
  color: "red",
  fontSize: "12px",
  marginBottom: "10px"
};
