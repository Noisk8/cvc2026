"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
        <section className="min-h-screen relative flex flex-col items-center justify-center pt-[110px] px-5 pb-[80px] overflow-hidden bg-[#e0ded6]">
            {/* Clean Official Poster Style: CSS Halftone Background */}
            <div className="absolute inset-0 bg-[#42CAE6] pointer-events-none"></div>
            <div className="absolute inset-0 opacity-[0.35] pointer-events-none mix-blend-color-burn" style={{
                backgroundImage: `radial-gradient(#0E5A7A 2.5px, transparent 2.5px)`,
                backgroundSize: '15px 15px'
            }}></div>
            <div className="absolute inset-0 opacity-[.20] bg-[url('/assets/paper-texture.png')] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}></div>

            {/* Organic Borders Frame (Enredaderas) */}
            <div className="absolute top-[-5%] left-[-5%] w-[400px] xl:w-[500px] pointer-events-none opacity-90 z-0 origin-center rotate-[130deg]">
                <Image src="/assets/Planta.png" alt="Enredadera Izquierda Superior" width={500} height={500} priority={true} fetchPriority="high" sizes="(max-width: 1280px) 400px, 500px" className="w-full h-auto drop-shadow-xl" />
            </div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] xl:w-[600px] pointer-events-none opacity-90 z-0 origin-center rotate-[-30deg]">
                <Image src="/assets/Planta.png" alt="Enredadera Derecha Inferior" width={600} height={600} sizes="(max-width: 1280px) 500px, 600px" className="w-full h-auto drop-shadow-xl" />
            </div>
            <div className="absolute top-[-10%] right-[-5%] w-[350px] xl:w-[450px] pointer-events-none opacity-80 z-0 origin-center rotate-[-120deg] scale-x-[-1]">
                <Image src="/assets/Planta.png" alt="Enredadera Derecha Superior" width={450} height={450} sizes="(max-width: 1280px) 350px, 450px" className="w-full h-auto drop-shadow-xl" />
            </div>

            {/* Graphic Elements */}
            <div className="absolute bottom-[2%] left-[1%] w-[350px] xl:w-[355px] animate-[float_12s_ease-in-out_infinite_reverse] hidden xl:block z-10 pointer-events-none">
                <Image src="/assets/guacamaya.png" alt="Guacamaya" width={355} height={355} sizes="(max-width: 1280px) 0px, 355px" className="w-full h-auto drop-shadow-2xl opacity-90" />
            </div>

            <div className="absolute bottom-[25%] right-[2%] w-[320px] xl:w-[400px] animate-[float_9s_ease-in-out_infinite] hidden md:block z-20 pointer-events-none">
                <Image src="/assets/Jaguar.png" alt="Jaguar" width={400} height={400} sizes="(max-width: 768px) 0px, (max-width: 1280px) 320px, 400px" className="w-full h-auto drop-shadow-2xl scale-x-[-1]" />
            </div>

            <div className="relative z-[15] text-center max-w-[1080px] flex flex-col items-center">

                <div className="w-[80%] max-w-[600px] mb-8 animate-[fadeUp_.7s_ease_both]">
                    <Image src="/assets/TEXTO_PRINCIPAL.png" alt="7mo Congreso Latinoamericano y Caribeño de Culturas Vivas Comunitarias" width={600} height={158} priority={true} fetchPriority="high" sizes="(max-width: 768px) 80vw, 600px" className="w-full h-auto drop-shadow-lg" />
                </div>

                <div className="inline-block bg-[#1a2512] text-amarillo font-barlow-condensed font-[700] text-[13px] tracking-[3px] uppercase px-[24px] py-[10px] mb-[26px] animate-[fadeUp_.7s_ease_.2s_both] shadow-xl border border-amarillo/30 rounded-full">
                    Colombia &middot; Abril 2026 &middot; 20+ Países
                </div>

                <div className="w-[90%] max-w-[700px] mb-12 animate-[fadeUp_.7s_ease_.4s_both]">
                    <Image src="/assets/TEXTO_INFERIOR.png" alt="Pasto - Cali - Medellín" width={700} height={42} priority={true} fetchPriority="high" sizes="(max-width: 768px) 90vw, 700px" className="w-full h-auto drop-shadow-md" />
                </div>

                <div className="flex justify-center gap-3 flex-wrap mb-14 animate-[fadeUp_.7s_ease_.6s_both]">
                    <div className="bg-[#f4efe8] border-2 border-[#E8711A] px-[22px] py-[16px] text-center min-w-[180px] transition-all duration-300 hover:-translate-y-2 shadow-[8px_8px_0px_#E8711A] rounded-lg">
                        <div className="font-barlow-condensed font-[900] text-[20px] uppercase tracking-[2px] text-[#E8711A]">
                            Pasto
                        </div>
                        <div className="text-[14px] text-oscuro/70 mt-1 font-[600]">17–19 Abril</div>
                        <div className="font-barlow-condensed text-[18px] font-[800] mt-2 text-oscuro bg-[#E8711A]/20 py-1 rounded">{cupos.pasto}</div>
                    </div>
                    <div className="bg-[#f4efe8] border-2 border-[#1A7A3C] px-[22px] py-[16px] text-center min-w-[180px] transition-all duration-300 hover:-translate-y-2 shadow-[8px_8px_0px_#1A7A3C] rounded-lg">
                        <div className="font-barlow-condensed font-[900] text-[20px] uppercase tracking-[2px] text-[#1A7A3C]">
                            Cali
                        </div>
                        <div className="text-[14px] text-oscuro/70 mt-1 font-[600]">20–22 Abril</div>
                        <div className="font-barlow-condensed text-[18px] font-[800] mt-2 text-oscuro bg-[#1A7A3C]/20 py-1 rounded">{cupos.cali}</div>
                    </div>
                    <div className="bg-[#f4efe8] border-2 border-[#D42B2B] px-[22px] py-[16px] text-center min-w-[180px] transition-all duration-300 hover:-translate-y-2 shadow-[8px_8px_0px_#D42B2B] rounded-lg">
                        <div className="font-barlow-condensed font-[900] text-[20px] uppercase tracking-[2px] text-[#D42B2B]">
                            Medellín
                        </div>
                        <div className="text-[14px] text-oscuro/70 mt-1 font-[600]">23–26 Abril</div>
                        <div className="font-barlow-condensed text-[18px] font-[800] mt-2 text-oscuro bg-[#D42B2B]/20 py-1 rounded">{cupos.medellin}</div>
                    </div>
                </div>

                <button
                    onClick={scrollToInscripcion}
                    className="relative inline-flex items-center justify-center p-4 px-10 py-4 overflow-hidden font-barlow-condensed font-[800] text-[22px] tracking-[2px] text-[#1a2512] transition-all duration-300 bg-[#F5C518] rounded-full hover:bg-[#F5C518] group shadow-[0_10px_40px_-10px_rgba(245,197,24,0.8)] hover:shadow-[0_20px_50px_-10px_rgba(245,197,24,1)] animate-[fadeUp_.7s_ease_.8s_both]"
                >
                    <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-[#E8711A] rounded-full group-hover:w-[120%] group-hover:h-56"></span>
                    <span className="relative flex items-center gap-2 group-hover:text-white">
                        ¡Inscríbete a la asamblea!
                        <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    </span>
                </button>
            </div>
        </section>
    );
}
