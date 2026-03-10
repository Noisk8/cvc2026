"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";



interface CupoPais {
    pais: string;
    pasto: number;
    cali: number;
    medellin: number;
}

const SEDE_KEYS = ['Pasto', 'Cali', 'Medellín', 'Todo el recorrido'] as const;
type SedeKey = typeof SEDE_KEYS[number];

export default function RegistroForm() {
    const t = useTranslations('form');
    const [registro, setRegistro] = useState<any>({
        nombre: "", apellido: "", identificacion: "", edad: "",
        email: "", telefono: "", pais: "", ciudad: "",
        genero: "", organizacion: "", actividad_principal: "", participacion_previa: "", anos_cvc: "", etnia: "",
        rol: "", descripcion: "", aporte: "",
        carta_aval: "", sede: "", intereses: [], necesidades: [], notas: "", tipo_dieta: "",
        comprobante_pago: "", fecha_transferencia: "", nombre_pagador: "", monto_superior: "", aporte_minga: "",
        compromiso_convivencia: false, compromiso_no_proselitismo: false
    });

    const [uploadingCarta, setUploadingCarta] = useState(false);

    const [cuposConfig, setCuposConfig] = useState<CupoPais[]>([]);
    const [registrosConfirmados, setRegistrosConfirmados] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");
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
        const { name, value, type, checked } = e.target;
        setFormError(null);
        setRegistro((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileUpload = async (e: any) => {
        try {
            setUploadingCarta(true);
            setFormError(null);
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 3 * 1024 * 1024) {
                const msg = t('error_size_3mb') || "El archivo excede el tamaño máximo permitido de 3MB.";
                alert(msg);
                setFormError(msg);
                setUploadingCarta(false);
                return;
            }

            const validExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
            const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
            if (!validExtensions.includes(fileExt)) {
                 const msg = t('error_format_invalid') || "Formato inválido. Solo se admiten archivos PDF, JPG y PNG.";
                 alert(msg);
                 setFormError(msg);
                 setUploadingCarta(false);
                 return;
            }

            const fileName = `${registro.identificacion || 'doc'}_${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('cartas_aval')
                .upload(filePath, file);

            if (uploadError) {
                console.error("Upload error:", uploadError);
                throw new Error(t('error_upload_bucket'));
            }

            const { data: { publicUrl } } = supabase.storage
                .from('cartas_aval')
                .getPublicUrl(filePath);

            setRegistro((prev: any) => ({ ...prev, carta_aval: publicUrl }));

        } catch (error: any) {
            setFormError(error.message || t('error_upload'));
        } finally {
            setUploadingCarta(false);
        }
    };

    const selectSede = (sede: string) => {
        setFormError(null);
        setRegistro((prev: any) => ({ ...prev, sede }));
    };

    const toggleArrayItem = (field: "intereses" | "necesidades", item: string) => {
        setFormError(null);
        setRegistro((prev: any) => {
            const list = prev[field] || [];
            
            // If field is intereses, replace the list with just this item (or empty if deselecting)
            if (field === "intereses") {
                return { ...prev, [field]: list.includes(item) ? [] : [item] };
            }

            // Otherwise (necesidades) keep multiple selection behavior
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
                return { isWarn: true, text: t('warning_cupo_no_hay', { pais, bloq: bloq.join(", ") }) };
        } else {
            const disp = getCountrySedeAvailability(sede);
            if (disp <= 0)
                return { isWarn: true, text: t('warning_cupo_completo', { pais, sede }) };
            if (cuposConfig.find((c) => c.pais === pais)) {
                return { isWarn: false, text: t('warning_cupo_disp', { pais, sede, disp }) };
            }
        }
        return null;
    };

    const warning = getCupoWarning();

    const validateForm = () => {
        const requireCarta = registro.pais !== "Colombia";
        if (!registro.nombre || !registro.apellido || !registro.identificacion || !registro.edad || !registro.email || !registro.telefono || !registro.pais || !registro.ciudad || !registro.genero || !registro.organizacion || !registro.actividad_principal || !registro.participacion_previa || !registro.anos_cvc || !registro.etnia || !registro.rol || !registro.descripcion || !registro.aporte || !registro.sede || (requireCarta && !registro.carta_aval) || !registro.aporte_minga) {
            return t('error_campos');
        }

        if (!registro.compromiso_convivencia || !registro.compromiso_no_proselitismo) {
            return t('error_compromiso');
        }

        if (registro.aporte === t('opciones_aporte.1') && !registro.monto_superior) {
            return t('error_monto');
        }

        // Validación de teléfono: solo números, mínimo 10 dígitos. Opcionalmente celular de Colombia si el país es Colombia
        const phoneClean = registro.telefono.replace(/[\s\-\+]/g, '');
        if (registro.pais === "Colombia") {
            if (!/^573\d{9}$|^3\d{9}$/.test(phoneClean)) {
                return t('error_phone_col');
            }
        } else {
            if (phoneClean.length < 8) {
                return t('error_phone_gen');
            }
        }

        // Validación de círculos (intereses)
        if (registro.intereses.length === 0) {
            return t('error_intereses');
        }

        // Validación de necesidades
        if (registro.necesidades.length === 0) {
            return t('error_necesidades');
        }

        // Validación de tipo de dieta si seleccionó alimentación especial
        if (registro.necesidades.includes("Alimentación especial") && !registro.tipo_dieta) {
            return t('error_dieta');
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
            setFormError(t('error_cupo'));
            return;
        }

        setLoading(true);
        setFormError(null);
        try {
            const payload = { ...registro };
            
            // Format dieta into necesidades if selected, and remove non-existent DB column
            if (payload.tipo_dieta) {
                payload.necesidades = payload.necesidades.map((n: string) => 
                    n === "Alimentación especial" || n === "Alimentação especial" || n.includes("alergia alimentaria") || n.includes("alergia alimentar")
                        ? `${n} (${payload.tipo_dieta})` 
                        : n
                );
            }
            delete payload.tipo_dieta;
            delete payload.compromiso_no_proselitismo;

            const { error } = await supabase.from("registros").insert([payload]);
            if (error) throw error;
            setSubmittedEmail(registro.email);
            setSuccess(true);
            setRegistro({
                ...registro,
                intereses: [], necesidades: [], notas: "", tipo_dieta: "", sede: "", nombre: "", apellido: "", identificacion: "", edad: "", email: "", telefono: "", pais: "", ciudad: "", genero: "", organizacion: "", actividad_principal: "", participacion_previa: "", anos_cvc: "", etnia: "", rol: "", descripcion: "", aporte: "", carta_aval: "", comprobante_pago: "", fecha_transferencia: "", nombre_pagador: "", monto_superior: "", aporte_minga: "", compromiso_convivencia: false, compromiso_no_proselitismo: false
            });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setFormError(t('error_general'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-[#1a2512] py-[90px] px-5 relative overflow-hidden" id="inscripcion">
            <div className="absolute inset-x-0 inset-y-[-1px] border-t-2 border-b-2 border-amarillo pointer-events-none opacity-20"></div>

            {/* Background Textures & Mesh */}
            <div className="absolute inset-0 opacity-[.35] bg-[url('/assets/paper-texture.png')] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}></div>
            <div className="absolute inset-0 opacity-[.25] pointer-events-none" style={{
                backgroundImage: "repeating-linear-gradient(0deg, var(--color-crema) 0, var(--color-crema) 1px, transparent 0, transparent 40px), repeating-linear-gradient(90deg, var(--color-crema) 0, var(--color-crema) 1px, transparent 0, transparent 40px)",
                maskImage: "linear-gradient(135deg, transparent 0%, black 15%, transparent 35%, black 50%, transparent 65%, black 85%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(135deg, transparent 0%, black 15%, transparent 35%, black 50%, transparent 65%, black 85%, transparent 100%)"
            }}></div>

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
                    {/* <div className="font-barlow-condensed font-[700] text-[15px] tracking-[4px] uppercase text-amarillo mb-[14px] flex justify-center items-center gap-[10px]">
                
                    </div> */}
                    <h2 className="font-playfair text-[clamp(32px,4.5vw,56px)] font-[700] text-crema mb-3">
                        {t('title')}<br />
                    </h2>
                    <p className="text-[18px] text-crema/45 max-w-[460px] mx-auto leading-[1.6]">
                        {t('subtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 backdrop-blur-md p-[24px] md:p-[46px] md:pb-[40px] max-w-[820px] mx-auto">

                    {/* Datos Personales */}
                    <div className="font-barlow-condensed font-[700] text-[20px] tracking-[4px] uppercase text-amarillo mb-6 pb-2.5 border-b border-amarillo/20 flex items-center gap-2">
                        ✧ {t('section_personal')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-[22px]">
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="nombre" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('nombre')}</label>
                            <input id="nombre" type="text" name="nombre" value={registro.nombre} onChange={handleChange} required placeholder={t('nombre')} className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="apellido" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('apellido')}</label>
                            <input id="apellido" type="text" name="apellido" value={registro.apellido} onChange={handleChange} required placeholder={t('apellido')} className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="identificacion" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('identificacion')}</label>
                            <input id="identificacion" type="text" name="identificacion" value={registro.identificacion} onChange={handleChange} required placeholder={t('identificacion')} className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="edad" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('edad')}</label>
                            <input id="edad" type="number" name="edad" value={registro.edad} onChange={handleChange} required placeholder={t('edad')} className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="etnia" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('etnia')}</label>
                            <select id="etnia" name="etnia" value={registro.etnia} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512]">
                                <option value="">{t('select_placeholder')}</option>
                                {(t.raw('opciones_etnia') as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="pais" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('pais')}</label>
                            <select id="pais" name="pais" value={registro.pais} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512] [&>optgroup]:bg-[#1a2512]">
                                <option value="">{t('select_pais')}</option>
                                <optgroup label={t('region_sur')}>
                                    <option>Argentina</option><option>Bolivia</option><option>Brasil</option><option>Chile</option><option>Colombia</option><option>Ecuador</option><option>Paraguay</option><option>Perú</option><option>Uruguay</option><option>Venezuela</option>
                                </optgroup>
                                <optgroup label={t('region_centro')}>
                                    <option>Costa Rica</option><option>Cuba</option><option>El Salvador</option><option>Guatemala</option><option>Honduras</option><option>México</option><option>Nicaragua</option><option>Panamá</option><option>Puerto Rico</option><option>República Dominicana</option>
                                </optgroup>
                                <optgroup label={t('region_otros')}>
                                    <option>España</option><option>Portugal</option><option>Otro</option>
                                </optgroup>
                            </select>
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="telefono" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('telefono')}</label>
                            <input id="telefono" type="tel" name="telefono" value={registro.telefono} onChange={handleChange} required placeholder="+57 300 000 0000" className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="ciudad" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('ciudad')}</label>
                            <input id="ciudad" type="text" name="ciudad" value={registro.ciudad} onChange={handleChange} required placeholder={t('ciudad')} className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="genero" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('genero')}</label>
                            <select id="genero" name="genero" value={registro.genero} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512]">
                                <option value="">{t('select_placeholder')}</option>
                                {(t.raw('opciones_genero') as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="email" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('email')}</label>
                            <input id="email" type="email" name="email" value={registro.email} onChange={handleChange} required placeholder="correo@ejemplo.com" className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                    </div>

                    <div className="h-[1px] bg-white/5 my-7"></div>

                    {/* Organización */}
                    <div className="font-barlow-condensed font-[700] text-[20px] tracking-[4px] uppercase text-amarillo mb-6 pb-2.5 border-b border-amarillo/20 flex items-center gap-2">
                        ✧ {t('section_organizacion')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="organizacion" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('organizacion')}</label>
                            <input id="organizacion" type="text" name="organizacion" value={registro.organizacion} onChange={handleChange} required placeholder={t('organizacion_placeholder')} className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="anos_cvc" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('anos_cvc')}</label>
                            <select id="anos_cvc" name="anos_cvc" value={registro.anos_cvc} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512]">
                                <option value="">{t('select_placeholder')}</option>
                                {(t.raw('opciones_anos_cvc') as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-[7px] md:col-span-2">
                            <label htmlFor="actividad_principal" className="font-barlow-condensed text-[16px] tracking-[2px] uppercase text-crema/80">{t('actividad_principal')}</label>
                            <p className="text-[16px] text-crema/40 leading-[1.5] mb-2">{t('actividad_principal_hint')}</p>
                            <input id="actividad_principal" type="text" name="actividad_principal" value={registro.actividad_principal} onChange={handleChange} required placeholder={t('actividad_principal')} className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30" />
                        </div>
                        <div className="flex flex-col gap-[7px] md:col-span-2">
                            <label htmlFor="participacion_previa" className="font-barlow-condensed text-[16px] tracking-[2px] uppercase text-crema/80">{t('participacion_previa')}</label>
                            <p className="text-[16px] text-crema/40 leading-[1.5] mb-2">{t('participacion_previa_hint')}</p>
                            <textarea id="participacion_previa" name="participacion_previa" value={registro.participacion_previa} onChange={handleChange} required placeholder={t('participacion_previa_placeholder')} className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30 min-h-[88px] resize-y"></textarea>
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="rol" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('rol')}</label>
                            <select id="rol" name="rol" value={registro.rol} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512]">
                                <option value="">{t('rol_placeholder')}</option>
                                {(t.raw('opciones_rol') as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-[7px] md:col-span-2 mt-2">
                            <label htmlFor="descripcion" className="font-barlow-condensed text-[16px] tracking-[2px] uppercase text-crema/80">{t('descripcion')}</label>
                            <p className="text-[16px] text-crema/40 leading-[1.5] mb-2">{t('descripcion_hint')}</p>
                            <textarea id="descripcion" name="descripcion" value={registro.descripcion} onChange={handleChange} required placeholder={t('descripcion_placeholder')} className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30 min-h-[140px] resize-y"></textarea>
                        </div>

                        <div className={`flex flex-col gap-[7px] md:col-span-2 mt-2 p-4 md:p-6 border rounded-[4px] transition-all ${registro.pais === 'Colombia' ? 'bg-white/0 border-white/5 opacity-60' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex justify-between items-start gap-4 flex-wrap">
                                <div>
                                    <label htmlFor="carta_aval" className="font-barlow-condensed text-[16px] tracking-[2px] uppercase text-crema/80">{t('carta_aval')}</label>
                                    <p className="text-[16px] text-crema/40 leading-[1.5] mb-3">{t('carta_aval_hint')}</p>
                                </div>
                                {registro.pais === 'Colombia' && (
                                    <span className="text-amarillo/70 text-[13px] font-barlow-condensed uppercase tracking-[1px] px-2 py-1 bg-amarillo/5 border border-amarillo/10 rounded">No requerido p/ Colombia</span>
                                )}
                            </div>

                            <div className="flex items-center gap-4 flex-wrap">
                                <label className={`cursor-pointer border text-amarillo px-4 py-3 font-barlow text-[16px] transition-all flex items-center gap-2 ${uploadingCarta || registro.pais === 'Colombia' ? 'opacity-50 pointer-events-none bg-amarillo/5 border-amarillo/10' : 'bg-amarillo/10 border-amarillo/30 hover:bg-amarillo/20'}`}>
                                    <span className="font-[600]">{uploadingCarta ? t('upload_loading') : t('upload_select')}</span>
                                    <input
                                        type="file"
                                        id="carta_aval"
                                        accept="image/*,.pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={registro.pais === 'Colombia'}
                                    />
                                </label>
                                {registro.carta_aval && (
                                    <span className="text-[#5dd68c] bg-verde/10 px-3 py-1.5 border border-verde/20 text-[15px] flex items-center gap-2">
                                        ✓ {t('upload_success')}
                                    </span>
                                )}
                            </div>

                            {/* Input oculto para validación nativa del form si se requiere */}
                            <input type="text" className="h-0 w-0 opacity-0 absolute" value={registro.carta_aval} onChange={() => { }} required={registro.pais !== 'Colombia'} tabIndex={-1} />
                        </div>
                    </div>

                    <div className="h-[1px] bg-white/5 my-7"></div>

                    {/* Logística */}
                    <div className="font-barlow-condensed font-[700] text-[20px] tracking-[4px] uppercase text-amarillo mb-6 pb-2.5 border-b border-amarillo/20 flex items-center gap-2">
                        ✧ {t('section_logistica')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                        <div className="flex flex-col gap-[7px]">
                            <label htmlFor="aporte" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('aporte')}</label>
                            <select id="aporte" name="aporte" value={registro.aporte} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] appearance-none [&>option]:bg-[#1a2512]">
                                <option value="">{t('select_placeholder')}</option>
                                {(t.raw('opciones_aporte') as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-[7px] md:col-span-2">
                            <div className="p-4 bg-amarillo/10 border border-amarillo/20 rounded-[4px] mt-1 mb-2">
                                <h4 className="font-barlow-condensed font-[700] text-[16px] tracking-[1px] text-amarillo mb-1">{t('instrucciones_aporte_titulo')}</h4>
                                <p className="text-[15px] text-crema/80 leading-[1.6]">
                                    {t('instrucciones_aporte_texto')}
                                    <span className="font-bold text-amarillo block mt-1">{t('instrucciones_aporte_dolar')}</span>
                                    {t('instrucciones_aporte_nota')}
                                </p>
                            </div>
                        </div>

                        {registro.aporte === t('opciones_aporte.1') && (
                            <div className="flex flex-col gap-[15px] md:col-span-2 mt-2 p-5 bg-white/5 border border-white/10 rounded-[4px]">
                                <div className="flex flex-col gap-[7px] w-full">
                                    <label htmlFor="monto_superior" className="font-barlow-condensed text-[14px] tracking-[2px] uppercase text-amarillo">{t('monto_superior_label')}</label>
                                    <input id="monto_superior" type="text" name="monto_superior" value={registro.monto_superior} onChange={handleChange} placeholder={t('monto_superior_placeholder')} required className="bg-amarillo/10 border border-amarillo/30 text-crema px-4 py-2 font-barlow text-[16px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/20" />
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="h-[1px] bg-white/5 my-7"></div>

                    {/* Sede */}
                    <div className="font-barlow-condensed font-[700] text-[20px] tracking-[4px] uppercase text-amarillo mb-6 pb-2.5 border-b border-amarillo/20 flex items-center gap-2">
                        ✧ {t('section_sede')}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5">
                        {SEDE_KEYS.map((sedeKey, idx) => {
                            const isActive = registro.sede === sedeKey;
                            const sColor = sedeKey === 'Medellín' ? '#E8711A' : sedeKey === 'Cali' ? '#1A7A3C' : sedeKey === 'Pasto' ? '#F5C518' : '#D42B2B';
                            const label = (t.raw('opciones_sede') as string[])[idx];
                            const desc = (t.raw('sede_descripcion') as string[])[idx];
                            return (
                                <div key={sedeKey} onClick={() => selectSede(sedeKey)}
                                    className={`flex items-start gap-[10px] p-3.5 border border-white/5 cursor-pointer transition-all duration-200 ${isActive ? 'bg-white/10' : 'bg-white/5'}`} style={{ borderColor: isActive ? sColor : '' }}>
                                    <div className="w-4 h-4 border-2 border-white/25 rounded-full shrink-0 flex items-center justify-center transition-all duration-200 mt-0.5"
                                        style={{ borderColor: isActive ? sColor : '', backgroundColor: isActive ? sColor : '' }}>
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="font-barlow-condensed font-[700] text-[18px] uppercase tracking-[1px]" style={{ color: sColor }}>{label}</span>
                                        <span className="text-[15px] opacity-50 mt-0.5">
                                            {desc}
                                        </span>
                                        {registro.pais && sedeKey !== 'Todo el recorrido' && (
                                            <span className={`text-[15px] mt-1 px-2 py-1 rounded-[2px] w-fit ${getCountrySedeAvailability(sedeKey) > 0 ? 'bg-verde/15 text-[#5dd68c]' : 'bg-rojo/15 text-[#ff9090]'}`}>
                                                {getCountrySedeAvailability(sedeKey) > 0 ? t('cupo_disp', { count: getCountrySedeAvailability(sedeKey) }) : t('cupo_agotado')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-[7px] mt-5">
                        <label htmlFor="aporte_minga" className="font-barlow-condensed font-[700] text-[18px] tracking-[2px] uppercase text-amarillo">{t('aporte_minga')}</label>
                        <p className="text-[16px] text-crema/60 leading-[1.5] -mt-1 mb-2">{t('aporte_minga_help')}</p>
                        <textarea id="aporte_minga" name="aporte_minga" value={registro.aporte_minga} onChange={handleChange} required placeholder={t('aporte_minga_placeholder')} className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30 min-h-[110px] resize-y"></textarea>
                    </div>

                    {warning && (
                        <div className={`p-3 px-4 text-[16px] leading-[1.5] mt-3 ${warning.isWarn ? 'bg-rojo/10 border border-rojo/30 text-[#ff9090]' : 'bg-verde/10 border border-verde/25 text-[#5dd68c]'}`}>
                            {warning.text}
                        </div>
                    )}

                    {/* Intereses */}
                    <div className="h-[1px] bg-white/5 my-7"></div>
                    <div className="font-barlow-condensed font-[700] text-[20px] tracking-[4px] uppercase text-amarillo mb-6 pb-2.5 border-b border-amarillo/20 flex items-center gap-2">
                        ✧ {t('section_circulos')}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3.5">
                        {(t.raw('opciones_intereses') as string[]).map((int: string) => {
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
                        ✧ {t('section_necesidades')}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3.5">
                        {(t.raw('opciones_necesidades') as string[]).map((nec: string) => {
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

                    {registro.necesidades.includes("Alimentación especial") && (
                        <div className="flex flex-col gap-[7px] mt-4 p-4 bg-naranja/5 border border-naranja/20 rounded-[4px]">
                            <label htmlFor="tipo_dieta" className="font-barlow-condensed text-[16px] tracking-[2px] uppercase text-naranja">{t('tipo_dieta_label')}</label>
                            <select id="tipo_dieta" name="tipo_dieta" value={registro.tipo_dieta} onChange={handleChange} required className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-naranja focus:bg-naranja/5 appearance-none [&>option]:bg-[#1a2512]">
                                <option value="">{t('select_placeholder')}</option>
                                {(t.raw('opciones_dieta') as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col gap-[7px]">
                        <label htmlFor="notas" className="font-barlow-condensed text-[15px] tracking-[2px] uppercase text-crema/55">{t('notas')}</label>
                        <textarea id="notas" name="notas" value={registro.notas} onChange={handleChange} placeholder={t('notas_placeholder')} className="bg-white/5 border border-white/10 text-crema px-4 py-3 font-barlow text-[17px] outline-none transition-all duration-250 focus:border-amarillo focus:bg-amarillo/5 focus:shadow-[0_0_0_3px_rgba(245,197,24,0.09)] placeholder:text-crema/30 min-h-[88px]"></textarea>
                    </div>

                    <div className="h-[1px] bg-white/5 my-7"></div>

                    {/* COMPROMISO DE CONVIVENCIA */}
                    <div className="font-barlow-condensed font-[700] text-[20px] tracking-[4px] uppercase text-amarillo mb-4 pb-2.5 border-b border-amarillo/20 flex items-center gap-2">
                        {t('section_compromiso')}
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-[4px] mb-4">
                        <p className="text-[16px] text-crema/80 leading-[1.6] mb-4">
                            {t('compromiso_body')}
                        </p>

                        <label className="flex items-start gap-3 cursor-pointer group w-fit">
                            <div className={`mt-0.5 w-[22px] h-[22px] border-2 rounded-[3px] flex items-center justify-center transition-all duration-200 shrink-0 ${registro.compromiso_convivencia ? 'bg-amarillo border-amarillo text-oscuro' : 'border-white/30 group-hover:border-amarillo/50'}`}>
                                {registro.compromiso_convivencia && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                            </div>
                            <span className={`text-[17px] font-barlow transition-colors duration-200 ${registro.compromiso_convivencia ? 'text-amarillo font-bold' : 'text-crema/70 group-hover:text-crema'}`}>{t('compromiso_si')}</span>
                            <input
                                type="checkbox"
                                name="compromiso_convivencia"
                                checked={registro.compromiso_convivencia}
                                onChange={handleChange}
                                className="hidden"
                                required
                            />
                        </label>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-[4px] mb-2">
                        <p className="text-[16px] text-crema/80 leading-[1.6] mb-4">
                            {t('compromiso_no_proselitismo_body')}
                        </p>

                        <label className="flex items-start gap-3 cursor-pointer group w-fit">
                            <div className={`mt-0.5 w-[22px] h-[22px] border-2 rounded-[3px] flex items-center justify-center transition-all duration-200 shrink-0 ${registro.compromiso_no_proselitismo ? 'bg-amarillo border-amarillo text-oscuro' : 'border-white/30 group-hover:border-amarillo/50'}`}>
                                {registro.compromiso_no_proselitismo && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                            </div>
                            <span className={`text-[17px] font-barlow transition-colors duration-200 ${registro.compromiso_no_proselitismo ? 'text-amarillo font-bold' : 'text-crema/70 group-hover:text-crema'}`}>{t('compromiso_si')}</span>
                            <input
                                type="checkbox"
                                name="compromiso_no_proselitismo"
                                checked={registro.compromiso_no_proselitismo}
                                onChange={handleChange}
                                className="hidden"
                                required
                            />
                        </label>
                    </div>

                    {formError && (
                        <div className="bg-rojo/10 border border-rojo/30 text-[#ff9090] p-4 text-[17px] leading-[1.5] mt-6 text-center font-barlow font-[500]">
                            {formError}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap mt-7">
                        <p className="text-[16px] text-crema/40 max-w-[280px] leading-[1.5] text-center md:text-left">
                            {t('submit_disclaimer')}
                        </p>
                        <button type="submit" disabled={loading} className="w-full md:w-auto overflow-hidden relative group bg-rojo text-white border-none font-barlow-condensed font-[700] text-[20px] tracking-[3px] uppercase px-11 py-4 cursor-pointer transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5">
                            <div className={`absolute inset-0 bg-verde origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 z-0 ${loading ? 'hidden' : ''}`}></div>
                            <span className="relative z-10">{loading ? t('submit_loading') : success ? t('submit_success') : t('submit_label')}</span>
                        </button>
                    </div>

                    {success && (
                        <div className="bg-verde/20 border border-verde text-crema p-7 text-center mt-5 animate-[fadeUp_.4s_ease]">
                            <h3 className="font-playfair text-[22px] text-amarillo mb-2">{t('success_title')}</h3>
                            <p className="mb-3">{t('success_body')}</p>
                            <p className="text-[18px] text-white font-barlow-condensed tracking-[1px] mb-3 p-2 bg-black/20 rounded inline-block">
                                ✉️ {submittedEmail}
                            </p>
                            <p><strong>{t('success_footer')}</strong></p>
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
