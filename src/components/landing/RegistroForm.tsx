"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const OPCIONES_INTERESES = [
    "Arte para la transformación social", "Comunicación libre y compartida",
    "Memoria y patrimonio", "Ciencia y tecnología comunitaria",
    "Letras y palabras", "Actos festivos comunitarios",
    "Mediación cultural", "Educación popular · Universidad",
    "Géneros y feminismos", "Salud y buen vivir",
    "Otras economías · Cooperación", "Pueblos originarios y étnicos",
    "Niñeces, adolescencias y juventudes", "Derechos humanos · Justicia Cultural",
    "Gobernanza y políticas públicas"
];

const OPCIONES_NECESIDADES = [
    "Alojamiento", "Apoyo de transporte", "Alimentación especial",
    "Accesibilidad / movilidad reducida", "Intérprete / traducción",
    "Cuidado de niñes", "Visa / carta de invitación",
    "Apoyo para ponencia", "Beca / subsidio"
];

interface CupoPais {
    pais: string;
    pasto: number;
    cali: number;
    medellin: number;
}

export default function RegistroForm() {
    const [registro, setRegistro] = useState<any>({
        nombre: "", email: "", telefono: "", pais: "", ciudad: "",
        genero: "", organizacion: "", anos_cvc: "", etnia: "",
        rol: "", descripcion: "", aporte: "", comite: "No",
        sede: "", intereses: [], necesidades: [], notas: ""
    });

    const [cuposConfig, setCuposConfig] = useState<CupoPais[]>([]);
    const [registrosConfirmados, setRegistrosConfirmados] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            const { data: cupos } = await supabase.from("cupos_pais").select("*");
            if (cupos) setCuposConfig(cupos);

            const { data: regs } = await supabase
                .from("registros")
                .select("pais, sede")
                .eq("estado", "confirmed");
            if (regs) setRegistrosConfirmados(regs);
        }
        fetchData();
    }, [supabase]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormError(null);
        setRegistro((prev: any) => ({ ...prev, [name]: value }));
    };

    const selectSede = (sede: string) => {
        setFormError(null);
        setRegistro((prev: any) => ({ ...prev, sede }));
    };

    const toggleArrayItem = (field: "intereses" | "necesidades", item: string) => {
        setFormError(null);
        setRegistro((prev: any) => {
            const list = prev[field] || [];
            const newList = list.includes(item)
                ? list.filter((i: string) => i !== item)
                : [...list, item];
            return { ...prev, [field]: newList };
        });
    };

    const getCountrySedeAvailability = (sede: string): number => {
        const pais = registro.pais;
        if (!pais) return 999;

        const cupo = cuposConfig.find((c) => c.pais === pais);
        if (!cupo) return 999;

        const limit = sede === "Pasto" ? cupo.pasto : sede === "Cali" ? cupo.cali : cupo.medellin;
        const used = registrosConfirmados.filter(
            (r) => r.pais === pais && (r.sede === sede || r.sede === "Todo el recorrido")
        ).length;

        return Math.max(0, limit - used);
    };

    const getCupoWarning = () => {
        const { pais, sede } = registro;
        if (!pais || !sede) return null;

        if (sede === "Todo el recorrido") {
            const bloq = ["Pasto", "Cali", "Medellín"].filter((s) => getCountrySedeAvailability(s) <= 0);
            if (bloq.length > 0)
                return { isWarn: true, text: `⚠️ No hay cupo para ${pais} en: ${bloq.join(", ")}. Elige otra sede.` };
        } else {
            const disp = getCountrySedeAvailability(sede);
            if (disp <= 0)
                return { isWarn: true, text: `⚠️ El cupo para ${pais} en ${sede} está completo. Elige otra sede o contacta al equipo.` };
            if (cuposConfig.find((c) => c.pais === pais)) {
                return { isWarn: false, text: `ℹ️ Cupo disponible para ${pais} en ${sede}: ${disp}` };
            }
        }
        return null;
    };

    const warning = getCupoWarning();

    const validateForm = () => {
        // Validación de campos vacíos básicos
        if (!registro.nombre || !registro.email || !registro.telefono || !registro.pais || !registro.ciudad || !registro.genero || !registro.organizacion || !registro.anos_cvc || !registro.etnia || !registro.rol || !registro.descripcion || !registro.aporte || !registro.comite || !registro.sede) {
            return "Por favor, completa todos los campos del formulario. Todos son requeridos.";
        }

        // Validación de teléfono: solo números, mínimo 10 dígitos. Opcionalmente celular de Colombia si el país es Colombia
        const phoneClean = registro.telefono.replace(/[\s\-\+]/g, '');
        if (registro.pais === "Colombia") {
            if (!/^573\d{9}$|^3\d{9}$/.test(phoneClean)) {
                return "Por favor, ingresa un número de celular válido de Colombia (ej. 3001234567 o +573001234567).";
            }
        } else {
            if (phoneClean.length < 8) {
                return "Por favor, ingresa un número de teléfono válido.";
            }
        }

        // Validación de círculos (intereses)
        if (registro.intereses.length === 0) {
            return "Por favor, selecciona al menos un interés (Círculos de la Palabra).";
        }

        // Validación de necesidades
        if (registro.necesidades.length === 0) {
            return "Por favor, selecciona al menos una necesidad logística. Si no tienes o ya está cubierta, especifícalo en los comentarios.";
        }

        return null;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const errorMsg = validateForm();
        if (errorMsg) {
            setFormError(errorMsg);
            // Scroll to top of form to see error
            document.getElementById("inscripcion")?.scrollIntoView({ behavior: "smooth" });
            return;
        }

        if (warning?.isWarn) {
            setFormError("No hay cupos disponibles para tu país en la sede seleccionada.");
            return;
        }

        setLoading(true);
        setFormError(null);
        try {
            const { error } = await supabase.from("registros").insert([registro]);
            if (error) throw error;
            setSuccess(true);
            setRegistro({
                ...registro,
                intereses: [], necesidades: [], notas: "", sede: "", nombre: "", email: "", telefono: "", pais: "", ciudad: "", genero: "", organizacion: "", anos_cvc: "", etnia: "", rol: "", descripcion: "", aporte: "", comite: ""
            });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setFormError("Hubo un error al enviar tu registro. Por favor, intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-[#1a2512] py-[90px] px-5 relative overflow-hidden" id="inscripcion">
            <div className="absolute inset-x-0 inset-y-[-1px] border-t-2 border-b-2 border-amarillo pointer-events-none opacity-20"></div>

            {/* Background Textures & Mesh */}
            <div className="absolute inset-0 opacity-[.35] bg-[url('/assets/paper-texture.png')] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}></div>
            <div className="absolute inset-0 opacity-[.06] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, var(--color-crema) 0, var(--color-crema) 1px, transparent 0, transparent 40px), repeating-linear-gradient(90deg, var(--color-crema) 0, var(--color-crema) 1px, transparent 0, transparent 40px)" }}></div>

            {/* Graphics */}
            {/* <div className="absolute top-[10%] right-[3%] w-[280px] md:w-[320px] animate-[float_10s_ease-in-out_infinite] hidden lg:block z-10 opacity-90 pointer-events-none">
                <img src="/assets/Sol.png" alt="Sol" className="w-full h-auto drop-shadow-xl" />
            </div> */}

            {/* <div className="absolute top-[30%] left-[0%] w-[350px] animate-[float_10s_ease-in-out_infinite_reverse] hidden xl:block z-10 opacity-70 pointer-events-none">
                <img src="/assets/Megafono.png" alt="Megafono" className="w-full h-auto drop-shadow-xl" />
            </div> */}

            {/* <div className="absolute bottom-[20%] right-[40%] w-[400px] animate-[float_12s_ease-in-out_infinite_reverse] hidden xl:block z-10 opacity-90 pointer-events-none">
                <img src="/assets/manos.png" alt="Manos" className="w-full h-auto drop-shadow-2xl" />
            </div> */}

            <div className="max-w-[1080px] mx-auto relative z-20">
                <div className="text-center mb-[50px]">
                    <div className="font-barlow-condensed font-[700] text-[15px] tracking-[4px] uppercase text-amarillo mb-[14px] flex justify-center items-center gap-[10px]">
                        Inscripción
                    </div>
                    <h2 className="font-playfair text-[clamp(32px,4.5vw,56px)] font-[700] text-crema mb-3">
                        Trae tu taburete<br />a la gran asamblea
                    </h2>
                    <p className="text-[18px] text-crema/45 max-w-[460px] mx-auto leading-[1.6]">
                        Regístrate, cuéntanos quién eres, tu proceso y qué necesitas para participar plenamente.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 backdrop-blur-md p-[24px] md:p-[46px] md:pb-[40px] max-w-[820px] mx-auto">

                    {/* Datos Personales */}
                    <div className="font-barlow-condensed font-[700] text-[20px] tracking-[4px] uppercase text-amarillo mb-6 pb-2.5 border-b border-amarillo/20 flex items-center gap-2">
                        ✧ Datos personales
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-[22px]">
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="nombre" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">Nombre completo *</label>
                            <input id="nombre" type="text" name="nombre" value={registro.nombre} onChange={handleChange} required placeholder="Nombre y apellido" className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="email" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">Correo electrónico *</label>
                            <input id="email" type="email" name="email" value={registro.email} onChange={handleChange} required placeholder="correo@ejemplo.com" className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="telefono" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">Teléfono / WhatsApp *</label>
                            <input id="telefono" type="tel" name="telefono" value={registro.telefono} onChange={handleChange} required placeholder="+57 300 000 0000" className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="pais" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">País de origen *</label>
                            <select id="pais" name="pais" value={registro.pais} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512] [&>optgroup]:bg-[#1a2512]">
                                <option value="">Selecciona tu país</option>
                                <optgroup label="América del Sur">
                                    <option>Argentina</option><option>Bolivia</option><option>Brasil</option><option>Chile</option><option>Colombia</option><option>Ecuador</option><option>Paraguay</option><option>Perú</option><option>Uruguay</option><option>Venezuela</option>
                                </optgroup>
                                <optgroup label="Centroamérica y Caribe">
                                    <option>Costa Rica</option><option>Cuba</option><option>El Salvador</option><option>Guatemala</option><option>Honduras</option><option>México</option><option>Nicaragua</option><option>Panamá</option><option>Puerto Rico</option><option>República Dominicana</option>
                                </optgroup>
                                <optgroup label="Otros">
                                    <option>España</option><option>Portugal</option><option>Otro</option>
                                </optgroup>
                            </select>
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="ciudad" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">Ciudad / Región *</label>
                            <input id="ciudad" type="text" name="ciudad" value={registro.ciudad} onChange={handleChange} required placeholder="¿De dónde vienes?" className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="genero" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">Identidad de género *</label>
                            <select id="genero" name="genero" value={registro.genero} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512]">
                                <option value="">Selecciona</option><option>Prefiero no decir</option><option>Mujer</option><option>Hombre</option><option>No binario/a</option><option>Otro</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-[1px] bg-white/5 my-7"></div>

                    {/* Organización */}
                    <div className="font-barlow-condensed font-[700] text-[20px] tracking-[4px] uppercase text-amarillo mb-6 pb-2.5 border-b border-amarillo/20 flex items-center gap-2">
                        ✧ Tu organización y proceso CVC
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="organizacion" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">Organización / colectivo *</label>
                            <input id="organizacion" type="text" name="organizacion" value={registro.organizacion} onChange={handleChange} required placeholder="Nombre de tu organización" className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="anos_cvc" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">¿Cuántos años lleva tu proceso CVC? *</label>
                            <select id="anos_cvc" name="anos_cvc" value={registro.anos_cvc} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512]">
                                <option value="">Selecciona</option><option>Menos de 1 año</option><option>1 - 3 años</option><option>4 - 7 años</option><option>8 - 12 años</option><option>13 - 20 años</option><option>Más de 20 años</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="etnia" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">Pertenencia étnica *</label>
                            <select id="etnia" name="etnia" value={registro.etnia} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512]">
                                <option value="">Selecciona</option><option>Ninguna / No aplica</option><option>Pueblo originario / indígena</option><option>Afrodescendiente</option><option>Raizal</option><option>Palenquero/a</option><option>Rom / Gitano</option><option>Mestizo/a</option><option>Otro</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="rol" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">Rol en el congreso *</label>
                            <select id="rol" name="rol" value={registro.rol} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512]">
                                <option value="">Cómo participas</option><option>Ponente de experiencia significativa</option><option>Artista / Performer</option><option>Gestor/a cultural comunitario/a</option><option>Mediador/a cultural</option><option>Formador/a / Educador/a popular</option><option>Investigador/a</option><option>Delegado/a de gobierno</option><option>Participante general</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-[7px] md:col-span-2 mt-2">
                            <label htmlFor="descripcion" className="font-barlow-condensed text-[16px] tracking-[2px] uppercase text-crema/80">Descripción y justificación de tu propuesta o experiencia *</label>
                            <p className="text-[16px] text-crema/40 leading-[1.5] mb-2">Para que tu participación sea más significativa, cuéntanos en 100-300 palabras: ¿De qué trata tu proceso u organización? ¿En qué contexto o territorio trabajan? ¿Cuáles son sus principales metodologías o impactos? Si eres ponente o artista, describe brevemente la experiencia o acto que te gustaría compartir en el Congreso.</p>
                            <textarea id="descripcion" name="descripcion" value={registro.descripcion} onChange={handleChange} required placeholder="Escribe aquí el resumen de tu proceso y/o propuesta..." className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30 min-h-[140px] resize-y"></textarea>
                        </div>
                    </div>

                    <div className="h-[1px] bg-white/5 my-7"></div>

                    {/* Logística */}
                    <div className="font-barlow-condensed font-[700] text-[20px] tracking-[4px] uppercase text-amarillo mb-6 pb-2.5 border-b border-amarillo/20 flex items-center gap-2">
                        ✧ Logística y aporte
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="aporte" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">¿Vas a pagar aporte? *</label>
                            <select id="aporte" name="aporte" value={registro.aporte} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512]">
                                <option value="">Selecciona</option><option>Sí, puedo pagar el aporte completo</option><option>Sí, puedo pagar un aporte parcial</option><option>Necesito apoyo / beca</option><option>Mi organización cubre los costos</option><option>Gobierno / institución cubre costos</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="comite" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">¿Perteneces a algún comité? *</label>
                            <select id="comite" name="comite" value={registro.comite} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512]">
                                <option value="">Selecciona</option><option value="No">No</option><option>Sí – Comité Nariño / Pasto</option><option>Sí – Comité Valle / Cali</option><option>Sí – Comité Antioquia / Medellín</option><option>Sí – Comité Nacional</option><option>Sí – Comité Internacional</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-[1px] bg-white/5 my-7"></div>

                    {/* Sede */}
                    <div className="font-barlow-condensed font-[700] text-[20px] tracking-[4px] uppercase text-amarillo mb-6 pb-2.5 border-b border-amarillo/20 flex items-center gap-2">
                        ✧ Sede(s) a las que asistes
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5">
                        {['Pasto', 'Cali', 'Medellín', 'Todo el recorrido'].map((sede) => {
                            const isActive = registro.sede === sede;
                            const sColor = sede === 'Pasto' ? '#E8711A' : sede === 'Cali' ? '#1A7A3C' : sede === 'Medellín' ? '#F5C518' : '#D42B2B';
                            return (
                                <div key={sede} onClick={() => selectSede(sede)}
                                    className={`flex items-start gap-[10px] p-3.5 border border-white/5 cursor-pointer transition-all duration-200 ${isActive ? 'bg-white/10' : 'bg-white/5'}`} style={{ borderColor: isActive ? sColor : '' }}>
                                    <div className="w-4 h-4 border-2 border-white/25 rounded-full shrink-0 flex items-center justify-center transition-all duration-200 mt-0.5"
                                        style={{ borderColor: isActive ? sColor : '', backgroundColor: isActive ? sColor : '' }}>
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="font-barlow-condensed font-[700] text-[18px] uppercase tracking-[1px]" style={{ color: sColor }}>{sede}</span>
                                        <span className="text-[15px] opacity-50 mt-0.5">
                                            {sede === 'Pasto' ? '17–19 Abr · Nariño' : sede === 'Cali' ? '20–22 Abr · Valle del Cauca' : sede === 'Medellín' ? '23–26 Abr · Antioquia' : 'Pasto → Cali → Medellín'}
                                        </span>
                                        {registro.pais && sede !== 'Todo el recorrido' && (
                                            <span className={`text-[15px] mt-1 px-2 py-1 rounded-[2px] w-fit ${getCountrySedeAvailability(sede) > 0 ? 'bg-verde/15 text-[#5dd68c]' : 'bg-rojo/15 text-[#ff9090]'}`}>
                                                {getCountrySedeAvailability(sede) > 0 ? `${getCountrySedeAvailability(sede)} cupos disp.` : '✕ Agotado'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {warning && (
                        <div className={`p-3 px-4 text-[16px] leading-[1.5] mt-3 ${warning.isWarn ? 'bg-rojo/10 border border-rojo/30 text-[#ff9090]' : 'bg-verde/10 border border-verde/25 text-[#5dd68c]'}`}>
                            {warning.text}
                        </div>
                    )}

                    {/* Intereses */}
                    <div className="h-[1px] bg-white/5 my-7"></div>
                    <div className="font-barlow-condensed font-[700] text-[20px] tracking-[4px] uppercase text-amarillo mb-6 pb-2.5 border-b border-amarillo/20 flex items-center gap-2">
                        ✧ Círculos de la Palabra – tus intereses
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3.5">
                        {OPCIONES_INTERESES.map((int) => {
                            const active = registro.intereses.includes(int);
                            return (
                                <div key={int} onClick={() => toggleArrayItem('intereses', int)} className={`flex items-start gap-2.5 p-3 border border-white/5 cursor-pointer transition-all duration-200 ${active ? 'bg-amarillo/10 border-amarillo' : 'bg-white/5 hover:border-amarillo/30 hover:bg-amarillo/5'}`}>
                                    <div className={`w-4 h-4 border-2 shrink-0 flex items-center justify-center transition-all duration-200 mt-px ${active ? 'bg-amarillo border-amarillo text-oscuro' : 'border-white/25'}`}>
                                        {active && <span className="text-[14px] font-[900]">✓</span>}
                                    </div>
                                    <div className="text-[16px] leading-[1.4] text-crema/70">{int}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Necesidades */}
                    <div className="h-[1px] bg-white/5 my-7"></div>
                    <div className="font-barlow-condensed font-[700] text-[20px] tracking-[4px] uppercase text-amarillo mb-6 pb-2.5 border-b border-amarillo/20 flex items-center gap-2">
                        ✧ Necesidades logísticas
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3.5">
                        {OPCIONES_NECESIDADES.map((nec) => {
                            const active = registro.necesidades.includes(nec);
                            return (
                                <div key={nec} onClick={() => toggleArrayItem('necesidades', nec)} className={`flex items-center gap-2.5 py-2.5 px-3.5 border border-white/5 cursor-pointer transition-all duration-200 ${active ? 'bg-naranja/10 border-naranja' : 'bg-white/5 hover:border-naranja/30 hover:bg-naranja/5'}`}>
                                    <div className={`w-4 h-4 border-2 rounded-full shrink-0 flex items-center justify-center transition-all duration-200 ${active ? 'bg-naranja border-naranja text-white' : 'border-white/25'}`}>
                                        {active && <span className="text-[14px] font-[900]">✓</span>}
                                    </div>
                                    <div className="text-[16px] text-crema/70">{nec}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="h-[1px] bg-white/5 my-7"></div>

                    <div className="flex flex-col gap-[7px]">
                        <label htmlFor="notas" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">Comentarios adicionales</label>
                        <textarea id="notas" name="notas" value={registro.notas} onChange={handleChange} placeholder="¿Algo más que quieras contarnos?" className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30 min-h-[88px]"></textarea>
                    </div>

                    {formError && (
                        <div className="bg-rojo/10 border border-rojo/30 text-[#ff9090] p-4 text-[17px] leading-[1.5] mt-6 text-center font-barlow font-[500]">
                            {formError}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap mt-7">
                        <p className="text-[16px] text-crema/40 max-w-[280px] leading-[1.5] text-center md:text-left">
                            Al inscribirte confirmas tu interés. El equipo organizador se pondrá en contacto pronto. Los campos con * son obligatorios.
                        </p>
                        <button type="submit" disabled={loading} className="w-full md:w-auto overflow-hidden relative group bg-rojo text-white border-none font-barlow-condensed font-[700] text-[20px] tracking-[3px] uppercase px-11 py-4 cursor-pointer transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5">
                            <div className={`absolute inset-0 bg-verde origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 z-0 ${loading ? 'hidden' : ''}`}></div>
                            <span className="relative z-10">{loading ? 'Enviando...' : success ? '✓ Inscripción Enviada' : 'Inscribirme al Congreso →'}</span>
                        </button>
                    </div>

                    {success && (
                        <div className="bg-verde/20 border border-verde text-crema p-7 text-center mt-5 animate-[fadeUp_.4s_ease]">
                            <h3 className="font-playfair text-[22px] text-amarillo mb-2">¡Bienvenido/a al movimiento! 🌿</h3>
                            <p>Tu inscripción fue registrada. El equipo del VII Congreso se pondrá en contacto pronto.<br /><strong>¡Hasta Pasto, Cali y Medellín!</strong></p>
                        </div>
                    )}

                </form>
            </div>

            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(2deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
            `}</style>
        </section>
    );
}
