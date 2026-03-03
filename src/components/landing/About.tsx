import Image from "next/image";

export default function About() {
    return (
        <section className="bg-[#f4efe8] text-oscuro py-[120px] px-5 relative overflow-hidden group border-t-2 border-oscuro/10">
            {/* Texture */}
            <div className="absolute inset-0 opacity-[.35] bg-[url('/assets/paper-texture.png')] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}></div>

            <div className="absolute font-playfair font-[900] text-[280px] left-[-20px] md:left-[2%] top-1/2 -translate-y-1/2 opacity-[.04] text-rojo leading-none mix-blend-multiply content-['VII'] group-hover:opacity-[.08] transition-opacity duration-500 z-0">
                VII
            </div>

            {/* Graphic Elements */}

            <div className="absolute top-[-20%] right-[-2%] w-[250px] animate-[float_12s_ease-in-out_infinite] hidden md:block z-10 opacity-90 pointer-events-none">
                <Image src="/assets/Planta.png" alt="Planta" width={250} height={250} sizes="(max-width: 768px) 0px, 250px" className="w-full h-auto drop-shadow-lg" />
            </div>

            <div className="max-w-[1080px] mx-auto z-20 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[70px] items-center">
                    {/* Text content */}
                    <div>
                        <div className="font-barlow-condensed font-[700] text-[11px] tracking-[4px] uppercase text-rojo mb-[14px] flex items-center gap-[10px]">
                            Sobre el Congreso
                            <span className="h-[1px] bg-rojo w-[50px] inline-block"></span>
                        </div>
                        <h2 className="font-playfair text-[clamp(28px,3.5vw,46px)] font-[700] leading-[1.12] mb-5">
                            Un encuentro que mueve continentes
                        </h2>
                        <p className="text-[15px] leading-[1.8] text-oscuro/70 font-barlow">
                            El Séptimo Congreso Latinoamericano y Caribeño de las Culturas Vivas Comunitarias es la
                            continuación de un movimiento vivo que lleva más de 20 años tejiendo comunidades desde
                            el arte, la cultura popular y los saberes ancestrales.
                            <br />
                            <br />
                            Colombia recibe esta celebración con todo el corazón. Tres ciudades, diez días, 15
                            círculos de la palabra, ferias de saberes, seminarios y rituales. Una gran asamblea
                            de humanidades sentipensantes.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
                        <div className="bg-oscuro text-crema p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 group/s1">
                            <div className="font-playfair text-[46px] font-[900] leading-none text-amarillo">+20</div>
                            <div className="font-barlow-condensed text-[13px] tracking-[2px] uppercase opacity-50 mt-[6px]">
                                Países participantes
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-amarillo origin-left scale-x-0 group-hover/s1:scale-x-100 transition-transform duration-300"></div>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-amarillo z-0"></div>
                        </div>

                        <div className="bg-oscuro text-crema p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 group/s2">
                            <div className="font-playfair text-[46px] font-[900] leading-none text-rojo">450</div>
                            <div className="font-barlow-condensed text-[13px] tracking-[2px] uppercase opacity-50 mt-[6px]">
                                Participantes totales
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-rojo origin-left scale-x-0 group-hover/s2:scale-x-100 transition-transform duration-300"></div>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-rojo z-0"></div>
                        </div>

                        <div className="bg-oscuro text-crema p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 group/s3">
                            <div className="font-playfair text-[46px] font-[900] leading-none text-verde">15</div>
                            <div className="font-barlow-condensed text-[13px] tracking-[2px] uppercase opacity-50 mt-[6px]">
                                Círculos de la Palabra
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-verde origin-left scale-x-0 group-hover/s3:scale-x-100 transition-transform duration-300"></div>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-verde z-0"></div>
                        </div>

                        <div className="bg-oscuro text-crema p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 group/s4">
                            <div className="font-playfair text-[46px] font-[900] leading-none text-naranja">10</div>
                            <div className="font-barlow-condensed text-[13px] tracking-[2px] uppercase opacity-50 mt-[6px]">
                                Días de encuentro
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-naranja origin-left scale-x-0 group-hover/s4:scale-x-100 transition-transform duration-300"></div>
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-naranja z-0"></div>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
}
