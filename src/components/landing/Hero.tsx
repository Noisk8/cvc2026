"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CAP_SEDE = { Pasto: 150, Cali: 250, Medellin: 450 };

export default function Hero() {
    const [cupos, setCupos] = useState({ pasto: "...", cali: "...", medellin: "..." });
    const supabase = createClient();

    useEffect(() => {
        async function fetchCupos() {
            const { data } = await supabase.from("registros").select("sede, estado").eq("estado", "confirmed");
            if (!data) return;

            const cPasto = data.filter((r) => r.sede === "Pasto" || r.sede === "Todo el recorrido").length;
            const cCali = data.filter((r) => r.sede === "Cali" || r.sede === "Todo el recorrido").length;
            const cMed = data.filter((r) => r.sede === "Medellín" || r.sede === "Todo el recorrido").length;

            const lPasto = Math.max(0, CAP_SEDE.Pasto - cPasto);
            const lCali = Math.max(0, CAP_SEDE.Cali - cCali);
            const lMed = Math.max(0, CAP_SEDE.Medellin - cMed);

            setCupos({
                pasto: lPasto > 0 ? `${lPasto} cupos` : "Agotado",
                cali: lCali > 0 ? `+${lCali} disponibles` : "Agotado",
                medellin: lMed > 0 ? `+${lMed} disponibles` : "Agotado",
            });
        }

        fetchCupos();
    }, [supabase]);

    const scrollToInscripcion = () => {
        document.getElementById("inscripcion")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="min-h-screen relative flex flex-col items-center justify-center pt-[110px] px-5 pb-[80px] overflow-hidden bg-gradient-to-br from-[#0F1A0A] via-[#152510] to-[#0a1218]">
            <div className="absolute inset-0 opacity-[.055] hero-bg-pattern pointer-events-none"></div>

            <div className="absolute rounded-full opacity-[.07] animate-[orbFloat_15s_ease-in-out_infinite] w-[650px] h-[650px] bg-rojo top-[-220px] right-[-180px] pointer-events-none"></div>
            <div className="absolute rounded-full opacity-[.07] animate-[orbFloat_15s_ease-in-out_infinite] w-[450px] h-[450px] bg-amarillo bottom-[-120px] left-[-120px] pointer-events-none" style={{ animationDelay: "-6s" }}></div>
            <div className="absolute rounded-full opacity-[.07] animate-[orbFloat_15s_ease-in-out_infinite] w-[280px] h-[280px] bg-verde top-[35%] left-[4%] pointer-events-none" style={{ animationDelay: "-11s" }}></div>

            <div className="absolute font-playfair font-[900] text-[clamp(180px,28vw,360px)] leading-none text-transparent opacity-[.055] right-[-15px] top-1/2 -translate-y-1/2 select-none pointer-events-none stroke-text hidden md:block">
                7
            </div>

            <div className="relative z-[2] text-center max-w-[980px]">
                <div className="inline-block bg-amarillo text-oscuro font-barlow-condensed font-[700] text-[11px] tracking-[3px] uppercase px-[18px] py-[7px] mb-[26px] animate-[fadeUp_.7s_ease_both]">
                    Colombia &middot; Abril 2026 &middot; 20+ Países
                </div>

                <h1 className="font-playfair text-[clamp(44px,8.5vw,96px)] font-[900] leading-[.93] mb-3 animate-[fadeUp_.7s_ease_.12s_both]">
                    <span className="text-rojo">Culturas</span>
                    <br />
                    <span className="text-amarillo">Vivas</span>
                    <br />
                    Comunitarias
                </h1>

                <p className="font-barlow-condensed font-[300] text-[clamp(14px,2.2vw,22px)] tracking-[5px] uppercase text-crema/60 mb-7 animate-[fadeUp_.7s_ease_.24s_both]">
                    Séptimo Congreso Latinoamericano y Caribeño
                </p>

                <p className="font-playfair italic text-[clamp(22px,3.8vw,46px)] text-amarillo mb-11 animate-[fadeUp_.7s_ease_.36s_both]">
                    "Todas las Voces"
                </p>

                <div className="flex justify-center gap-1 flex-wrap mb-11 animate-[fadeUp_.7s_ease_.46s_both]">
                    <div className="bg-white/5 border border-white/10 px-[22px] py-[16px] text-center min-w-[170px] transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
                        <div className="font-barlow-condensed font-[700] text-[17px] uppercase tracking-[2px] text-pasto">
                            Pasto
                        </div>
                        <div className="text-[12px] opacity-[.55] mt-1">17–19 Abril &middot; Nariño</div>
                        <div className="font-barlow-condensed text-[18px] font-[600] mt-1">{cupos.pasto}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-[22px] py-[16px] text-center min-w-[170px] transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
                        <div className="font-barlow-condensed font-[700] text-[17px] uppercase tracking-[2px] text-cali">
                            Cali
                        </div>
                        <div className="text-[12px] opacity-[.55] mt-1">
                            20–22 Abril &middot; Valle del Cauca
                        </div>
                        <div className="font-barlow-condensed text-[18px] font-[600] mt-1">{cupos.cali}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-[22px] py-[16px] text-center min-w-[170px] transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
                        <div className="font-barlow-condensed font-[700] text-[17px] uppercase tracking-[2px] text-medellin">
                            Medellín
                        </div>
                        <div className="text-[12px] opacity-[.55] mt-1">23–26 Abril &middot; Antioquia</div>
                        <div className="font-barlow-condensed text-[18px] font-[600] mt-1">{cupos.medellin}</div>
                    </div>
                </div>

                <button
                    onClick={scrollToInscripcion}
                    className="group inline-block bg-rojo text-white font-barlow-condensed font-[700] text-[17px] tracking-[3px] uppercase px-[48px] py-[17px] border-none cursor-pointer transition-all duration-300 relative overflow-hidden animate-[fadeUp_.7s_ease_.56s_both] hover:text-oscuro hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-amarillo -translate-x-full transition-transform duration-300 z-0 group-hover:translate-x-0"></div>
                    <span className="relative z-10">✧ Inscríbete ahora</span>
                </button>
            </div>
        </section>
    );
}
