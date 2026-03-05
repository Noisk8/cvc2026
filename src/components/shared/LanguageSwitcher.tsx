"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/navigation";

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (newLocale: string) => {
        if (newLocale === locale) return;
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <div className="flex items-center gap-1 border border-white/15 rounded-full overflow-hidden">
            {([
                { code: 'es', label: '🇨🇴 ES' },
                { code: 'pt', label: '🇧🇷 PT' },
            ] as const).map(({ code, label }) => (
                <button
                    key={code}
                    onClick={() => switchLocale(code)}
                    className={`font-barlow-condensed font-[700] text-[11px] tracking-[2px] uppercase px-3 py-1.5 transition-all duration-200 cursor-pointer
                        ${locale === code
                            ? 'bg-amarillo text-oscuro'
                            : 'bg-transparent text-crema/45 hover:text-amarillo'
                        }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
