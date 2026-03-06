"use client";

import { useState } from "react";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: "",
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
        setMessage("Sedang memproses...");

        try {
            const response = await fetch("http://52.4.194.198:8080/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(`Registrasi Sukses! Halo ${data.username}, datamu berhasil disimpan.`);
            } else {
                setMessage("Registrasi Gagal! Email mungkin sudah terdaftar.");
            }
        } catch (error) {
            setMessage("Gagal terhubung ke server. Pastikan Backend Spring Boot menyala!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", fontFamily: "sans-serif" }}>
            <h2>Daftar Akun Baru</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                    <label>Nama Lengkap:</label><br />
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                    />
                </div>

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
                    {isLoading ? "Loading..." : "Register"}
                </button>
            </form>

            {message && (
                <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
                    {message}
                </div>
            )}
        </div>
    );
}