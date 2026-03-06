"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Sedang memeriksa data...");

    try {
      const response = await fetch("http://52.4.194.198:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Login Sukses! Selamat datang kembali, ${data.fullName}.`);

        // TODO: tambahkan logika untuk pindah ke halaman Dashboard/Profile

      } else {
        setMessage("Login Gagal! Email atau password salah.");
      }
    } catch (error) {
      setMessage("Gagal terhubung ke server. Pastikan Backend Spring Boot menyala!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div style={{ maxWidth: "400px", margin: "50px auto", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2>Login ke JSON Platform</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label>Email:</label><br />
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>

          <div>
            <label>Password:</label><br />
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>

          <button
              type="submit"
              disabled={isLoading}
              style={{ padding: "10px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>

        {message && (
            <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "#f9f9f9", textAlign: "center" }}>
              {message}
            </div>
        )}

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}>
          Belum punya akun? <Link href="/register" style={{ color: "#0070f3", textDecoration: "none" }}>Daftar di sini</Link>
        </div>
      </div>
  );
}