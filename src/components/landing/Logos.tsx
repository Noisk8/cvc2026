import Image from "next/image";

export default function Logos() {
    return (
        <section className="bg-[#e0ded6] text-oscuro py-[80px] px-5 relative overflow-hidden border-t-2 border-[#1a2512]/10">
            {/* Texture */}
            <div className="absolute inset-0 opacity-[.35] bg-[url('/assets/paper-texture.png')] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}></div>

            <div className="max-w-[1080px] mx-auto relative z-20">
                <div className="text-center mb-12">
                    <div className="font-barlow-condensed font-[700] text-[13px] tracking-[4px] uppercase text-rojo mb-[14px] flex items-center justify-center gap-[10px]">
                        <span className="h-[1px] bg-rojo w-[30px] inline-block"></span>
                        Aliados y Organizadores
                        <span className="h-[1px] bg-rojo w-[30px] inline-block"></span>
                    </div>
                </div>

                <div className="flex flex-nowrap items-center gap-x-8 md:gap-x-12 opacity-80 mix-blend-multiply w-full overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <Image src="/assets/logos/1_Logo_latam_y_el_caribe_letras_color_fondo_transparente.png" alt="Logo CVC LATAM" width={180} height={180} className="w-[100px] md:w-[130px] h-[100px] md:h-[130px] shrink-0 object-contain hover:scale-105 transition-transform duration-300" />
                    <Image src="/assets/logos/Logo_Plataforma_y_Mapa_Congreso2.png" alt="Plataforma CVC" width={200} height={200} className="w-[140px] md:w-[180px] h-[100px] md:h-[130px] shrink-0 object-contain hover:scale-105 transition-transform duration-300" />
                    {/* <Image src="/assets/logos/CULTURASCOLOR.png" alt="Culturas Vivas" width={180} height={180} className="w-[100px] md:w-[130px] h-[100px] md:h-[130px] shrink-0 object-contain hover:scale-105 transition-transform duration-300" /> */}
                    <Image src="/assets/logos/Copia_de_logos_cvc_suroccidente_colMesa_de_trabajo_3.png" alt="CVC Suroccidente 3" width={180} height={180} className="w-[100px] md:w-[130px] h-[100px] md:h-[130px] shrink-0 object-contain hover:scale-105 transition-transform duration-300" />
                    <Image src="/assets/logos/pp.png" alt="CVC Suroccidente 4" width={180} height={180} className="w-[100px] md:w-[130px] h-[100px] md:h-[130px] shrink-0 object-contain hover:scale-105 transition-transform duration-300" />
                    <Image src="/assets/logos/logo3.png" alt="Logo Plat" width={200} height={200} className="w-[140px] md:w-[180px] h-[100px] md:h-[130px] shrink-0 object-contain hover:scale-105 transition-transform duration-300" />
                    <Image src="/assets/logos/Logo.png" alt="Logo Plat" width={200} height={200} className="w-[140px] md:w-[180px] h-[100px] md:h-[130px] shrink-0 object-contain hover:scale-105 transition-transform duration-300" />
                </div>
            </div>
        </section>
    );
}
