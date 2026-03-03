export default function Footer() {
    return (
        <>
            <footer className="bg-oscuro border-t border-white/5 py-11 px-5 text-center">
                <div className="max-w-[1080px] mx-auto">
                    <div className="flex items-center justify-center gap-6 mb-5 flex-wrap">
                        <div className="font-[700] text-[12px] tracking-[2px] uppercase text-crema/35 border border-white/10 px-4 py-2 font-barlow-condensed">
                            Plataforma Puente · CVC
                        </div>
                        <div className="font-[700] text-[12px] tracking-[2px] uppercase text-crema/35 border border-white/10 px-4 py-2 font-barlow-condensed">
                            Red Colombiana de Teatro en Comunidad
                        </div>
                        <div className="font-[700] text-[12px] tracking-[2px] uppercase text-crema/35 border border-white/10 px-4 py-2 font-barlow-condensed">
                            Cultura Viva Comunitaria
                        </div>
                    </div>
                    <p className="text-[12px] text-crema/30 leading-relaxed">
                        VII Congreso Latinoamericano y Caribeño de las Culturas Vivas
                        Comunitarias · Colombia 2026<br />
                        <a
                            href="mailto:plataformapuente@gmail.com"
                            className="text-amarillo no-underline"
                        >
                            plataformapuente@gmail.com
                        </a>
                    </p>
                </div>
            </footer>
            <div className="flex h-[5px] relative top-auto">
                <div className="bg-rojo flex-1"></div>
                <div className="bg-amarillo flex-1"></div>
                <div className="bg-verde flex-1"></div>
                <div className="bg-azul flex-1"></div>
                <div className="bg-naranja flex-1"></div>
            </div>
        </>
    );
}
