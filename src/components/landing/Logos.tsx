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

                <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-80 mix-blend-multiply">
                    <Image src="/assets/logos/1_Logo_latam_y_el_caribe_letras_color_fondo_transparente.png" alt="Logo CVC LATAM" width={400} height={400} className="h-[100px] w-auto max-w-[130px] object-contain hover:scale-105 transition-transform duration-300" />
                    <Image src="/assets/logos/CULTURASCOLOR.png" alt="Culturas Vivas" width={400} height={300} className="h-[100px] w-auto max-w-[150px] object-contain hover:scale-105 transition-transform duration-300" />
                    <Image src="/assets/logos/Programa_Nacional_CVC_Color.png" alt="Programa Nacional CVC" width={400} height={400} className="h-[100px] w-auto max-w-[110px] object-contain hover:scale-105 transition-transform duration-300" />
                    <Image src="/assets/logos/Logo_CVC_Nariño_y_Putumayo__jpg.png" alt="CVC Nariño" width={300} height={400} className="h-[100px] w-auto max-w-[110px] object-contain hover:scale-105 transition-transform duration-300" />
                    <Image src="/assets/logos/Logo_Plataforma_y_Mapa_Congreso.png" alt="Plataforma CVC" width={600} height={200} className="h-[100px] w-auto max-w-[200px] object-contain hover:scale-105 transition-transform duration-300" />
                    <Image src="/assets/logos/logos_cvc_suroccidente_colMesa_de_trabajo_2.png" alt="CVC Suroccidente 2" width={400} height={400} className="h-[100px] w-auto max-w-[110px] object-contain hover:scale-105 transition-transform duration-300" />
                    <Image src="/assets/logos/Copia_de_logos_cvc_suroccidente_colMesa_de_trabajo_3.png" alt="CVC Suroccidente 3" width={400} height={400} className="h-[100px] w-auto max-w-[110px] object-contain hover:scale-105 transition-transform duration-300" />
                    <Image src="/assets/logos/Copia_de_logos_cvc_suroccidente_colMesa_de_trabajo_4.png" alt="CVC Suroccidente 4" width={400} height={400} className="h-[100px] w-auto max-w-[180px] object-contain hover:scale-105 transition-transform duration-300" />
                    <Image src="/assets/logos/Logo.png" alt="Logo Plat" width={400} height={200} className="h-[100px] w-auto max-w-[110px] object-contain hover:scale-105 transition-transform duration-300" />
                </div>
            </div>
        </section>
    );
}
