"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import InscritosTable from "@/components/admin/InscritosTable";
import CuposManager from "@/components/admin/CuposManager";
import Link from "next/link";

export default function Dashboard() {
    const [session, setSession] = useState<any>(null);
    const [registros, setRegistros] = useState<any[]>([]);
    const [cuposConfig, setCuposConfig] = useState<any[]>([]);
    const [tab, setTab] = useState<"inscritos" | "cupos">("inscritos");
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push("/admin/login");
            } else {
                setSession(session);
                fetchData();
            }
        });
    }, [router, supabase]);

    const fetchData = async () => {
        const { data: rData } = await supabase.from("registros").select("*").order("created_at", { ascending: false });
        if (rData) setRegistros(rData);

        const { data: cData } = await supabase.from("cupos_pais").select("*").order("pais");
        if (cData) setCuposConfig(cData);

        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    const exportCSV = () => {
        const h = ['#', 'Fecha', 'Nombre', 'Email', 'Tel', 'País', 'Ciudad', 'Género', 'Organización', 'Años CVC', 'Etnia', 'Rol', 'Sede', 'Aporte', 'Comité', 'Estado', 'Intereses', 'Necesidades', 'Descripción', 'Notas'];
        const rows = registros.map((r, i) => [
            i + 1, new Date(r.created_at).toLocaleDateString(), r.nombre, r.email, r.telefono, r.pais, r.ciudad, r.genero, r.organizacion, r.anos_cvc, r.etnia, r.rol, r.sede, r.aporte, r.comite, r.estado, (r.intereses || []).join(' | '), (r.necesidades || []).join(' | '), r.descripcion, r.notas
        ].map(v => '"' + (v || '').toString().replace(/"/g, '""') + '"').join(','));

        const csv = [h.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'inscritos-cvc-2026.csv';
        a.click();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-amarillo">Cargando...</div>;

    const confirmedSede = (sede: string) => registros.filter(r => r.estado === 'confirmed' && (r.sede === sede || r.sede === 'Todo el recorrido')).length;

    return (
        <div className="bg-[#0a130a] min-h-screen pt-[5px]">
            <div className="bg-[#0a130a]/95 border-b border-white/5 py-3.5 px-7 flex items-center justify-between sticky top-[5px] z-50">
                <div className="flex items-center gap-4">
                    <span className="font-barlow-condensed font-[900] text-[15px] tracking-[3px] uppercase text-amarillo">✧ Panel Organizador</span>
                    <span className="bg-verde text-white text-[10px] font-[700] tracking-[2px] uppercase px-2.5 py-1">VII Congreso CVC</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/" className="font-barlow-condensed text-[11px] font-[700] tracking-[2px] uppercase bg-transparent border border-white/15 text-crema/50 px-3.5 py-2 cursor-pointer transition-all hover:border-blue-400 hover:text-blue-400">Ver Sitio ↗</Link>
                    <button onClick={exportCSV} className="font-barlow-condensed text-[12px] font-[700] tracking-[2px] uppercase bg-verde border-none text-white px-4 py-2 cursor-pointer transition-colors hover:bg-[#15612e]">⬇ Exportar CSV</button>
                    <button onClick={handleLogout} className="font-barlow-condensed text-[11px] font-[700] tracking-[2px] uppercase bg-transparent border border-white/15 text-crema/50 px-3.5 py-2 cursor-pointer transition-all hover:border-rojo hover:text-rojo">← Salir</button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-0.5 my-0.5">
                <div className="bg-white/5 p-4.5 border-b-[3px] border-amarillo transition-colors hover:bg-white/10">
                    <div className="font-playfair text-[36px] font-[900] leading-none text-amarillo">{registros.length}</div>
                    <div className="font-barlow-condensed text-[11px] tracking-[2px] uppercase opacity-45 mt-1">Total inscritos</div>
                </div>
                <div className="bg-white/5 p-4.5 border-b-[3px] border-pasto transition-colors hover:bg-white/10">
                    <div className="font-playfair text-[36px] font-[900] leading-none text-pasto">{confirmedSede('Pasto')}</div>
                    <div className="font-barlow-condensed text-[11px] tracking-[2px] uppercase opacity-45 mt-1">Pasto</div>
                </div>
                <div className="bg-white/5 p-4.5 border-b-[3px] border-cali transition-colors hover:bg-white/10">
                    <div className="font-playfair text-[36px] font-[900] leading-none text-cali">{confirmedSede('Cali')}</div>
                    <div className="font-barlow-condensed text-[11px] tracking-[2px] uppercase opacity-45 mt-1">Cali</div>
                </div>
                <div className="bg-white/5 p-4.5 border-b-[3px] border-medellin transition-colors hover:bg-white/10">
                    <div className="font-playfair text-[36px] font-[900] leading-none text-medellin">{confirmedSede('Medellín')}</div>
                    <div className="font-barlow-condensed text-[11px] tracking-[2px] uppercase opacity-45 mt-1">Medellín</div>
                </div>
                <div className="bg-white/5 p-4.5 border-b-[3px] border-verde transition-colors hover:bg-white/10">
                    <div className="font-playfair text-[36px] font-[900] leading-none text-verde">{registros.filter(r => r.estado === 'confirmed').length}</div>
                    <div className="font-barlow-condensed text-[11px] tracking-[2px] uppercase opacity-45 mt-1">Confirmados</div>
                </div>
                <div className="bg-white/5 p-4.5 border-b-[3px] border-naranja transition-colors hover:bg-white/10">
                    <div className="font-playfair text-[36px] font-[900] leading-none text-naranja">{registros.filter(r => r.estado === 'pending').length}</div>
                    <div className="font-barlow-condensed text-[11px] tracking-[2px] uppercase opacity-45 mt-1">Pendientes</div>
                </div>
            </div>

            <div className="flex bg-black/25 border-b border-white/5">
                <button onClick={() => setTab("inscritos")} className={`font-barlow-condensed text-[12px] font-[700] tracking-[2px] uppercase p-3.5 px-6 cursor-pointer bg-transparent border-none border-b-[2px] transition-colors ${tab === "inscritos" ? "text-amarillo border-amarillo bg-amarillo/5" : "text-crema/40 border-transparent hover:text-crema"}`}>
                    📋 Inscritos
                </button>
                <button onClick={() => setTab("cupos")} className={`font-barlow-condensed text-[12px] font-[700] tracking-[2px] uppercase p-3.5 px-6 cursor-pointer bg-transparent border-none border-b-[2px] transition-colors ${tab === "cupos" ? "text-amarillo border-amarillo bg-amarillo/5" : "text-crema/40 border-transparent hover:text-crema"}`}>
                    🌍 Cupos por País
                </button>
            </div>

            <div>
                {tab === "inscritos" && <InscritosTable registros={registros} cuposConfig={cuposConfig} refreshData={fetchData} />}
                {tab === "cupos" && <CuposManager cuposConfig={cuposConfig} registros={registros} refreshData={fetchData} />}
            </div>
        </div>
    );
}
