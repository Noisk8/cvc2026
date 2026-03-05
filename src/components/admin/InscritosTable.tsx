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
        if (modalRegistro && modalRegistro.id === id) setModalRegistro((prev: any) => ({ ...prev, estado: status }));
        refreshData();
    };

    const deleteRegistro = async (id: string, nombre: string) => {
        const confirmar = window.confirm(`¿Estás seguro que deseas ELIMINAR el registro de ${nombre}? Esta acción no se puede deshacer.`);
        if (confirmar) {
            await supabase.from("registros").delete().eq("id", id);
            if (modalRegistro && modalRegistro.id === id) setModalRegistro(null);
            refreshData();
        }
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
                                    <button onClick={() => changeStatus(r.id, 'confirmed')} className="font-barlow-condensed text-[11px] font-[700] uppercase px-3 py-1 cursor-pointer border border-[#3dd68c]/40 text-[#3dd68c] bg-transparent mx-0.5 hover:bg-cali/20" title="Confirmar">✓</button>
                                    <button onClick={() => changeStatus(r.id, 'rejected')} className="font-barlow-condensed text-[11px] font-[700] uppercase px-3 py-1 cursor-pointer border border-[#ff7070]/40 text-[#ff7070] bg-transparent mx-0.5 hover:bg-rojo/20" title="Rechazar">✕</button>
                                    <button onClick={() => setModalRegistro(r)} className="font-barlow-condensed text-[11px] font-[700] uppercase px-3 py-1 cursor-pointer border border-white/15 text-crema/50 bg-transparent mx-0.5 hover:border-white/40 hover:text-crema" title="Ver ficha">Ver</button>
                                    <button onClick={() => deleteRegistro(r.id, r.nombre)} className="font-barlow-condensed text-[11px] font-[700] uppercase px-2 py-1 cursor-pointer border border-rojo/50 text-rojo bg-transparent ml-2 hover:bg-rojo/20" title="Eliminar registro">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 mb-6">
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Email</label><p className="text-[13px]">{modalRegistro.email}</p></div>
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Teléfono</label><p className="text-[13px]">{modalRegistro.telefono || '—'}</p></div>
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">País</label><p className="text-[13px]">{modalRegistro.pais}</p></div>
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Ciudad</label><p className="text-[13px]">{modalRegistro.ciudad || '—'}</p></div>
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Sede(s)</label><p className="text-[13px]">{modalRegistro.sede}</p></div>
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Rol</label><p className="text-[13px]">{modalRegistro.rol}</p></div>
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Género</label><p className="text-[13px]">{modalRegistro.genero || '—'}</p></div>
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Etnia</label><p className="text-[13px]">{modalRegistro.etnia || '—'}</p></div>
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Años CVC</label><p className="text-[13px]">{modalRegistro.anos_cvc || '—'}</p></div>
                            <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Comité</label><p className="text-[13px]">{modalRegistro.comite || '—'}</p></div>
                            <div className="sm:col-span-2">
                                <label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Aporte de la organización</label>
                                <p className="text-[13px]">
                                    {modalRegistro.aporte || '—'}
                                    {modalRegistro.aporte === "Puedo hacer un aporte superior" && modalRegistro.monto_superior && ` (Monto: ${modalRegistro.monto_superior})`}
                                </p>
                            </div>
                            <div className="sm:col-span-2"><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Actividad principal</label><p className="text-[13px]">{modalRegistro.actividad_principal || '—'}</p></div>
                            <div className="sm:col-span-2"><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Participación previa</label><p className="text-[13px]">{modalRegistro.participacion_previa || '—'}</p></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            {modalRegistro.intereses && modalRegistro.intereses.length > 0 && (
                                <div>
                                    <h4 className="font-barlow-condensed text-[11px] tracking-[3px] uppercase text-amarillo mb-2 border-b border-white/10 pb-1">Círculos de interés</h4>
                                    <ul className="list-disc list-outside ml-4 text-[13px] leading-[1.6] text-crema/70 space-y-1">
                                        {modalRegistro.intereses.map((interes: string, idx: number) => (
                                            <li key={idx} className="break-words pl-1">{interes}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {modalRegistro.necesidades && modalRegistro.necesidades.length > 0 && (
                                <div>
                                    <h4 className="font-barlow-condensed text-[11px] tracking-[3px] uppercase text-amarillo mb-2 border-b border-white/10 pb-1">Necesidades logísticas</h4>
                                    <ul className="list-disc list-outside ml-4 text-[13px] leading-[1.6] text-crema/70 space-y-1">
                                        {modalRegistro.necesidades.map((necesidad: string, idx: number) => (
                                            <li key={idx} className="break-words pl-1">{necesidad}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {modalRegistro.descripcion && (
                            <div className="mb-5">
                                <h4 className="font-barlow-condensed text-[11px] tracking-[3px] uppercase text-amarillo mb-2 border-b border-white/10 pb-1">Proceso comunitario</h4>
                                <p className="text-[13px] leading-[1.7] text-crema/70 whitespace-pre-wrap">{modalRegistro.descripcion}</p>
                            </div>
                        )}

                        {modalRegistro.aporte_minga && (
                            <div className="mb-5">
                                <h4 className="font-barlow-condensed text-[11px] tracking-[3px] uppercase text-amarillo mb-2 border-b border-white/10 pb-1">Aporte a la Minga</h4>
                                <p className="text-[13px] leading-[1.7] text-crema/70 whitespace-pre-wrap">{modalRegistro.aporte_minga}</p>
                            </div>
                        )}

                        {modalRegistro.carta_aval && (
                            <div className="mb-5">
                                <h4 className="font-barlow-condensed text-[11px] tracking-[3px] uppercase text-amarillo mb-2 border-b border-white/10 pb-1">Carta Aval</h4>
                                {modalRegistro.carta_aval.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                    <a href={modalRegistro.carta_aval} target="_blank" rel="noopener noreferrer" className="block mt-2 hover:opacity-80 transition-opacity">
                                        <img src={modalRegistro.carta_aval} alt="Carta Aval" className="max-w-full max-h-[300px] object-contain border border-white/10" />
                                    </a>
                                ) : (
                                    <a href={modalRegistro.carta_aval} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-1 text-[#3dd68c] hover:underline text-[14px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                                        Ver Documento PDF / Archivo Adjunto
                                    </a>
                                )}
                            </div>
                        )}

                        {modalRegistro.comprobante_pago && (
                            <div className="mb-5 bg-white/5 p-4 border border-white/10 rounded">
                                <h4 className="font-barlow-condensed text-[11px] tracking-[3px] uppercase text-amarillo mb-3 border-b border-white/10 pb-1">Comprobante de Pago</h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Fecha de Transferencia</label><p className="text-[13px]">{modalRegistro.fecha_transferencia || '—'}</p></div>
                                    <div><label className="block font-barlow-condensed text-[10px] tracking-[3px] uppercase text-crema/40 mb-1">Pagador</label><p className="text-[13px]">{modalRegistro.nombre_pagador || 'Mismo inscrito'}</p></div>
                                </div>

                                {modalRegistro.comprobante_pago.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                    <a href={modalRegistro.comprobante_pago} target="_blank" rel="noopener noreferrer" className="block mt-2 hover:opacity-80 transition-opacity w-max">
                                        <img src={modalRegistro.comprobante_pago} alt="Comprobante de Pago" className="max-w-[100%] sm:max-w-[400px] max-h-[300px] object-contain border border-white/10" />
                                    </a>
                                ) : (
                                    <a href={modalRegistro.comprobante_pago} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-1 py-1.5 px-3 bg-white/10 rounded text-[#3dd68c] hover:bg-white/20 transition-colors text-[14px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                                        Ver Comprobante PDF / Archivo
                                    </a>
                                )}
                            </div>
                        )}

                        {modalRegistro.notas && (
                            <div className="mb-5">
                                <h4 className="font-barlow-condensed text-[11px] tracking-[3px] uppercase text-amarillo mb-2 border-b border-white/10 pb-1">Comentarios Adicionales</h4>
                                <p className="text-[13px] leading-[1.7] text-crema/70 whitespace-pre-wrap">{modalRegistro.notas}</p>
                            </div>
                        )}

                        <div className="flex gap-2.5 mt-5 flex-wrap items-center justify-between border-t border-white/10 pt-5">
                            <div className="flex gap-2.5 flex-wrap">
                                <button onClick={() => changeStatus(modalRegistro.id, 'confirmed')} className={`font-barlow-condensed text-[13px] font-[700] tracking-[1px] uppercase px-5 py-2 border cursor-pointer ${modalRegistro.estado === 'confirmed' ? 'bg-[#3dd68c]/20 border-[#3dd68c] text-[#3dd68c]' : 'border-[#3dd68c]/40 text-[#3dd68c] bg-transparent hover:bg-cali/20'}`}>✓ Confirmar</button>
                                <button onClick={() => changeStatus(modalRegistro.id, 'rejected')} className={`font-barlow-condensed text-[13px] font-[700] tracking-[1px] uppercase px-5 py-2 border cursor-pointer ${modalRegistro.estado === 'rejected' ? 'bg-[#ff7070]/20 border-[#ff7070] text-[#ff7070]' : 'border-[#ff7070]/40 text-[#ff7070] bg-transparent hover:bg-rojo/20'}`}>✕ Rechazar</button>
                            </div>

                            <button onClick={() => deleteRegistro(modalRegistro.id, modalRegistro.nombre)} className="font-barlow-condensed text-[13px] font-[700] tracking-[1px] uppercase px-4 py-2 border border-rojo/40 text-rojo bg-transparent hover:bg-rojo/20 flex items-center gap-2 cursor-pointer mt-4 sm:mt-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                Eliminar Registro
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
