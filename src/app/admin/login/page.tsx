"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

        if (authError) {
            setError("Credenciales incorrectas.");
            setLoading(false);
        } else {
            router.push("/admin/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#06100a] to-[#0e1a0c] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[.15] pointer-events-none" style={{
                backgroundImage: "repeating-linear-gradient(0deg, var(--color-verde) 0, var(--color-verde) 1px, transparent 0, transparent 40px), repeating-linear-gradient(90deg, var(--color-verde) 0, var(--color-verde) 1px, transparent 0, transparent 40px)",
                maskImage: "linear-gradient(135deg, transparent 0%, black 15%, transparent 35%, black 50%, transparent 65%, black 85%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(135deg, transparent 0%, black 15%, transparent 35%, black 50%, transparent 65%, black 85%, transparent 100%)"
            }}></div>

            <div className="bg-white/5 border border-white/10 p-[50px] px-11 w-full max-w-[420px] text-center relative z-10 backdrop-blur-[10px]">
                <div className="text-[40px] mb-5">🔐</div>
                <h2 className="font-playfair text-[28px] font-[700] mb-1.5 text-crema">Panel Organizador</h2>
                <p className="text-[13px] text-crema/45 mb-8 tracking-[1px]">VII CONGRESO CVC · 2026</p>

                <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-2">
                    <input
                        type="email"
                        placeholder="Correo administrador"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/10 border-2 border-white/15 text-crema px-4 py-3 font-barlow text-center outline-none transition-all duration-200 focus:border-amarillo focus:bg-amarillo/10"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/10 border-2 border-white/15 text-crema px-4 py-3 font-barlow text-center outline-none transition-all duration-200 focus:border-amarillo focus:bg-amarillo/10"
                    />

                    <div className="text-[13px] text-rojo min-h-[20px] mb-1">{error}</div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amarillo text-oscuro border-none font-barlow-condensed font-[700] text-[16px] tracking-[3px] uppercase p-4 cursor-pointer transition-all duration-250 hover:bg-rojo hover:text-white disabled:opacity-50"
                    >
                        {loading ? "Verificando..." : "Acceder →"}
                    </button>
                </form>

                <Link href="/" className="inline-block mt-5 text-[12px] tracking-[2px] uppercase text-crema/35 cursor-pointer transition-colors duration-200 hover:text-crema">
                    ← Volver al sitio
                </Link>
            </div>
        </div>
    );
}
