"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CuposManager({ cuposConfig, registros, refreshData }: { cuposConfig: any[]; registros: any[]; refreshData: () => void }) {
    const [nuevoPais, setNuevoPais] = useState("");
    const [nPasto, setNPasto] = useState<number | string>(5);
    const [nCali, setNCali] = useState<number | string>(5);
    const [nMed, setNMed] = useState<number | string>(10);
    const supabase = createClient();

    const handleAddPais = async () => {
        if (!nuevoPais) return alert("Selecciona un país");
        if (cuposConfig.find(c => c.pais === nuevoPais)) return alert(nuevoPais + " ya está en la lista.");

        await supabase.from("cupos_pais").insert([{
            pais: nuevoPais, pasto: parseInt(nPasto as string) || 0, cali: parseInt(nCali as string) || 0, medellin: parseInt(nMed as string) || 0
        }]);
        setNuevoPais("");
        refreshData();
    };

    const handleUpdate = async (id: string, field: string, value: string) => {
        await supabase.from("cupos_pais").update({ [field]: parseInt(value) || 0 }).eq("id", id);
        refreshData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar cupos de este país?")) return;
        await supabase.from("cupos_pais").delete().eq("id", id);
        refreshData();
    };

    const confirmedBySede = (pais: string, sede: string) => {
        return registros.filter(r => r.pais === pais && r.estado === 'confirmed' && (r.sede === sede || r.sede === 'Todo el recorrido')).length;
    };

    return (
        <div className="p-7 animate-in fade-in">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="font-barlow-condensed font-[700] text-[14px] tracking-[3px] uppercase text-amarillo mb-1.5">⚙ Cupos por país y sede</h3>
                    <p className="text-[13px] text-crema/45 max-w-[500px]">Define cuántos participantes puede confirmar cada país. Si un país no tiene cupo configurado, puede inscribirse libremente pero te recomendamos configurarlos.</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 mb-6">
                <div className="font-barlow-condensed text-[11px] font-[700] tracking-[3px] uppercase text-crema/40 mb-3">+ Agregar país con cupos</div>
                <div className="flex gap-2.5 flex-wrap items-end">
                    <div className="flex flex-col gap-1.5">
                        <span className="font-barlow-condensed text-[10px] tracking-[2px] uppercase text-crema/40">País</span>
                        <input type="text" value={nuevoPais} onChange={(e) => setNuevoPais(e.target.value)} placeholder="Ej. Argentina" className="bg-white/5 border border-white/15 text-crema px-3.5 py-2.5 font-barlow text-[13px] outline-none min-w-[180px] focus:border-amarillo" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="font-barlow-condensed text-[10px] tracking-[2px] uppercase text-crema/40">Cupo Pasto</span>
                        <input type="number" min="0" value={nPasto} onChange={(e) => setNPasto(e.target.value)} className="bg-white/5 border border-white/15 text-crema px-2.5 py-2.5 font-barlow text-[13px] text-center outline-none w-[80px] focus:border-amarillo" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="font-barlow-condensed text-[10px] tracking-[2px] uppercase text-crema/40">Cupo Cali</span>
                        <input type="number" min="0" value={nCali} onChange={(e) => setNCali(e.target.value)} className="bg-white/5 border border-white/15 text-crema px-2.5 py-2.5 font-barlow text-[13px] text-center outline-none w-[80px] focus:border-amarillo" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="font-barlow-condensed text-[10px] tracking-[2px] uppercase text-crema/40">Cupo Medellín</span>
                        <input type="number" min="0" value={nMed} onChange={(e) => setNMed(e.target.value)} className="bg-white/5 border border-white/15 text-crema px-2.5 py-2.5 font-barlow text-[13px] text-center outline-none w-[80px] focus:border-amarillo" />
                    </div>
                    <button onClick={handleAddPais} className="font-barlow-condensed text-[12px] font-[700] tracking-[2px] uppercase bg-amarillo border-none text-oscuro px-5 py-[11px] cursor-pointer transition-colors hover:bg-verde hover:text-white">+ Agregar</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                        <tr>
                            <th className="font-barlow-condensed text-[11px] font-[700] tracking-[2px] uppercase text-crema/40 p-2.5 px-3.5 text-left border-b border-white/10 bg-white/5">País</th>
                            <th className="font-barlow-condensed text-[11px] font-[700] tracking-[2px] uppercase text-crema/40 p-2.5 px-3.5 text-center border-b border-white/10 bg-white/5">C. Pasto</th>
                            <th className="font-barlow-condensed text-[11px] font-[700] tracking-[2px] uppercase text-crema/40 p-2.5 px-3.5 text-center border-b border-white/10 bg-white/5">Usado</th>
                            <th className="font-barlow-condensed text-[11px] font-[700] tracking-[2px] uppercase text-crema/40 p-2.5 px-3.5 text-center border-b border-white/10 bg-white/5">C. Cali</th>
                            <th className="font-barlow-condensed text-[11px] font-[700] tracking-[2px] uppercase text-crema/40 p-2.5 px-3.5 text-center border-b border-white/10 bg-white/5">Usado</th>
                            <th className="font-barlow-condensed text-[11px] font-[700] tracking-[2px] uppercase text-crema/40 p-2.5 px-3.5 text-center border-b border-white/10 bg-white/5">C. Med</th>
                            <th className="font-barlow-condensed text-[11px] font-[700] tracking-[2px] uppercase text-crema/40 p-2.5 px-3.5 text-center border-b border-white/10 bg-white/5">Usado</th>
                            <th className="border-b border-white/10 bg-white/5"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cuposConfig.length === 0 ? (
                            <tr><td colSpan={8} className="text-center p-7 text-[13px] opacity-40">Ninguno aún. Agrega países arriba.</td></tr>
                        ) : cuposConfig.map(c => {
                            const uP = confirmedBySede(c.pais, 'Pasto');
                            const uC = confirmedBySede(c.pais, 'Cali');
                            const uM = confirmedBySede(c.pais, 'Medellín');
                            return (
                                <tr key={c.id} className="hover:bg-white/5">
                                    <td className="p-2.5 px-3.5 border-b border-white/5 font-[500] text-crema/90">{c.pais}</td>
                                    <td className="p-2.5 px-3.5 border-b border-white/5 text-center"><input type="number" min="0" value={c.pasto} onChange={(e) => handleUpdate(c.id, 'pasto', e.target.value)} className="bg-white/10 border border-white/15 text-crema px-2 py-1 text-[13px] text-center w-[60px] outline-none focus:border-amarillo" /></td>
                                    <td className={`p-2.5 px-3.5 border-b border-white/5 text-center text-[12px] ${uP >= c.pasto ? 'text-rojo' : 'text-crema/50'}`}>{uP}</td>
                                    <td className="p-2.5 px-3.5 border-b border-white/5 text-center"><input type="number" min="0" value={c.cali} onChange={(e) => handleUpdate(c.id, 'cali', e.target.value)} className="bg-white/10 border border-white/15 text-crema px-2 py-1 text-[13px] text-center w-[60px] outline-none focus:border-amarillo" /></td>
                                    <td className={`p-2.5 px-3.5 border-b border-white/5 text-center text-[12px] ${uC >= c.cali ? 'text-rojo' : 'text-crema/50'}`}>{uC}</td>
                                    <td className="p-2.5 px-3.5 border-b border-white/5 text-center"><input type="number" min="0" value={c.medellin} onChange={(e) => handleUpdate(c.id, 'medellin', e.target.value)} className="bg-white/10 border border-white/15 text-crema px-2 py-1 text-[13px] text-center w-[60px] outline-none focus:border-amarillo" /></td>
                                    <td className={`p-2.5 px-3.5 border-b border-white/5 text-center text-[12px] ${uM >= c.medellin ? 'text-rojo' : 'text-crema/50'}`}>{uM}</td>
                                    <td className="p-2.5 px-3.5 border-b border-white/5"><button onClick={() => handleDelete(c.id)} className="bg-transparent border border-rojo/30 text-rojo/60 w-7 h-7 flex items-center justify-center cursor-pointer transition-colors hover:bg-rojo/20 hover:text-rojo">×</button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
