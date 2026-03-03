"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

export default function InscritosTable({ registros, cuposConfig, refreshData }: { registros: any[]; cuposConfig: any[]; refreshData: () => void }) {
    const [filter, setFilter] = useState("todos");
    const [search, setSearch] = useState("");
    const [modalRegistro, setModalRegistro] = useState<any>(null);
    const supabase = createClient();

    const changeStatus = async (id: string, status: string) => {
        await supabase.from("registros").update({ estado: status }).eq("id", id);
        if (modalRegistro && modalRegistro.id === id) setModalRegistro(null);
        refreshData();
    };

    const filteredData = registros.filter((r) => {
        if (filter === "confirmed") return r.estado === "confirmed";
        if (filter === "pending") return r.estado === "pending";
        if (filter !== "todos" && r.sede !== filter && r.sede !== "Todo el recorrido") return false;

        if (search) {
            const h = (r.nombre + r.email + r.pais + r.organizacion + r.ciudad + r.rol).toLowerCase();
            if (!h.includes(search.toLowerCase())) return false;
        }
        return true;
    });

    const getSedeColor = (sede: string) => sede === "Pasto" ? "text-pasto border-pasto/30 bg-pasto/10" : sede === "Cali" ? "text-[#3dd68c] border-[#3dd68c]/30 bg-cali/20" : sede === "Medellín" ? "text-medellin border-medellin/30 bg-medellin/10" : "text-[#ff7070] border-[#ff7070]/30 bg-rojo/20";
    const getStatusColor = (st: string) => st === "confirmed" ? "text-[#3dd68c] bg-cali/20" : st === "rejected" ? "text-[#ff7070] bg-rojo/15" : "text-amarillo bg-amarillo/15";

    return (
        <div className="animate-in fade-in">
            <div className="p-3.5 px-5 flex items-center gap-2.5 flex-wrap bg-white/5 border-b border-white/5">
                <span className="font-barlow-condensed text-[11px] tracking-[2px] uppercase text-crema/40">Filtrar:</span>
                {["todos", "Pasto", "Cali", "Medellín", "Todo el recorrido", "confirmed", "pending"].map((f) => (
                    <button key={f} onClick={() => setFilter(f)} className={`font-barlow-condensed text-[11px] font-[700] tracking-[2px] uppercase border px-3 py-1 cursor-pointer transition-colors ${filter === f ? (f === 'Pasto' ? 'bg-pasto border-pasto text-white' : f === 'Cali' ? 'bg-cali border-cali text-white' : f === 'Medellín' ? 'bg-medellin border-medellin text-oscuro' : 'bg-amarillo border-amarillo text-oscuro') : 'bg-white/5 border-white/10 text-crema/55 hover:border-white/30 hover:text-crema'} ${f === 'confirmed' && filter !== f ? 'border-cali/40 text-[#3dd68c]' : ''} ${f === 'pending' && filter !== f ? 'border-amarillo/40 text-amarillo' : ''}`}>
                        {f === "confirmed" ? "✓ Confirmados" : f === "pending" ? "∇ Pendientes" : f === "Todo el recorrido" ? "Recorrido completo" : f}
                    </button>
                ))}
                <input type="text" placeholder="Buscar nombre, país, org..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white/5 border border-white/10 text-crema px-3.5 py-1.5 font-barlow text-[13px] outline-none min-w-[200px] transition-colors focus:border-amarillo placeholder:text-crema/30 ml-auto" />
            </div>

            <div className="overflow-x-auto pb-10">
                <table className="w-full border-collapse min-w-[900px]">
                    <thead>
                        <tr>
                            {['#', 'Nombre', 'País', 'Organización', 'Años CVC', 'Sede(s)', 'Rol', 'Aporte', 'Comité', 'Estado', 'Acciones'].map(h => (
                                <th key={h} className="font-barlow-condensed text-[11px] font-[700] tracking-[2px] uppercase text-crema/40 p-3 px-4 text-left border-b border-white/5 bg-white/5 whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr><td colSpan={11} className="text-center py-10 opacity-40">No hay registros que coincidan con los filtros.</td></tr>
                        ) : filteredData.map((r, i) => (
                            <tr key={r.id} className="hover:bg-white/5 border-b border-white/5">
                                <td className="p-3 px-4 text-[12px] opacity-40">{i + 1}</td>
                                <td className="p-3 px-4 text-[13px] text-crema/80"><div className="font-[500] text-crema">{r.nombre}</div><div className="text-[11px] opacity-45">{new Date(r.created_at).toLocaleDateString()}</div></td>
                                <td className="p-3 px-4 text-[13px] text-crema/80">{r.pais}</td>
                                <td className="p-3 px-4 text-[13px] text-crema/80"><div>{r.organizacion || '—'}</div></td>
                                <td className="p-3 px-4 text-[12px] text-crema/80">{r.anos_cvc}</td>
                                <td className="p-3 px-4 text-[13px] text-crema/80"><span className={`font-barlow-condensed text-[11px] font-[700] tracking-[1px] uppercase px-2 py-0.5 border ${getSedeColor(r.sede)}`}>{r.sede === "Todo el recorrido" ? "Completo" : r.sede}</span></td>
                                <td className="p-3 px-4 text-[12px] text-crema/80">{r.rol}</td>
                                <td className="p-3 px-4 text-[11px] text-crema/80 max-w-[130px]">{r.aporte}</td>
                                <td className="p-3 px-4 text-[11px] text-crema/80">{r.comite}</td>
                                <td className="p-3 px-4 text-[13px] text-crema/80"><span className={`font-barlow-condensed text-[11px] font-[700] tracking-[1px] uppercase px-2.5 py-1 ${getStatusColor(r.estado)}`}>{r.estado === 'confirmed' ? '✓ Confirmado' : r.estado === 'rejected' ? '✕ Rechazado' : '∇ Pendiente'}</span></td>
                                <td className="p-3 px-4 whitespace-nowrap">
                                    <button onClick={() => changeStatus(r.id, 'confirmed')} className="font-barlow-condensed text-[11px] font-[700] uppercase px-3 py-1 cursor-pointer border border-[#3dd68c]/40 text-[#3dd68c] bg-transparent mx-0.5 hover:bg-cali/20">✓</button>
                                    <button onClick={() => changeStatus(r.id, 'rejected')} className="font-barlow-condensed text-[11px] font-[700] uppercase px-3 py-1 cursor-pointer border border-[#ff7070]/40 text-[#ff7070] bg-transparent mx-0.5 hover:bg-rojo/20">✕</button>
                                    <button onClick={() => setModalRegistro(r)} className="font-barlow-condensed text-[11px] font-[700] uppercase px-3 py-1 cursor-pointer border border-white/15 text-crema/50 bg-transparent mx-0.5 hover:border-white/40 hover:text-crema">Ver</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalRegistro && (
                <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-5 animate-in fade-in">
                    <div className="bg-[#0e1a0c] border border-white/10 max-w-[680px] w-full max-h-[90vh] overflow-y-auto p-9 relative">
                        <button onClick={() => setModalRegistro(null)} className="absolute top-4 right-4 bg-transparent border border-white/15 text-crema/50 w-8 h-8 flex items-center justify-center cursor-pointer transition-colors hover:border-rojo hover:text-rojo"><X size={16} /></button>
                        <div className="font-playfair text-[26px] font-[700] mb-1">{modalRegistro.nombre}</div>
                        <div className="text-[14px] text-crema/50 mb-5">{modalRegistro.organizacion} · {new Date(modalRegistro.created_at).toLocaleDateString()}</div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Email</label><p className="text-[13px]">{modalRegistro.email}</p></div>
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Teléfono</label><p className="text-[13px]">{modalRegistro.telefono || '—'}</p></div>
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">País</label><p className="text-[13px]">{modalRegistro.pais}</p></div>
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Rol</label><p className="text-[13px]">{modalRegistro.rol}</p></div>
                        </div>

                        {modalRegistro.descripcion && (
                            <div className="mb-4">
                                <h4 className="font-barlow-condensed text-[11px] tracking-[3px] uppercase text-amarillo mb-2">Proceso comunitario</h4>
                                <p className="text-[13px] leading-[1.7] text-crema/70">{modalRegistro.descripcion}</p>
                            </div>
                        )}

                        <div className="flex gap-2.5 mt-5 flex-wrap">
                            <button onClick={() => changeStatus(modalRegistro.id, 'confirmed')} className="font-barlow-condensed text-[13px] font-[700] tracking-[1px] uppercase px-5 py-2 border border-[#3dd68c]/40 text-[#3dd68c] bg-transparent hover:bg-cali/20">✓ Confirmar</button>
                            <button onClick={() => changeStatus(modalRegistro.id, 'rejected')} className="font-barlow-condensed text-[13px] font-[700] tracking-[1px] uppercase px-5 py-2 border border-[#ff7070]/40 text-[#ff7070] bg-transparent hover:bg-rojo/20">✕ Rechazar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
