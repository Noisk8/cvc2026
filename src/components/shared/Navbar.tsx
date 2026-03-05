"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
    const [count, setCount] = useState<number>(0);
    const supabase = createClient();

    useEffect(() => {
        async function fetchCount() {
            const { count } = await supabase
                .from("registros")
                .select("*", { count: "exact", head: true });
            if (count !== null) setCount(count);
        }
        fetchCount();

        // Set up realtime subscription for count
        const channel = supabase
            .channel("public:registros")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "registros" },
                () => {
                    setCount((c) => c + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <>
            <div className="flex h-[5px] fixed top-0 left-0 right-0 z-[999]">
                <div className="bg-rojo flex-1"></div>
                <div className="bg-amarillo flex-1"></div>
                <div className="bg-verde flex-1"></div>
                <div className="bg-azul flex-1"></div>
                <div className="bg-naranja flex-1"></div>
            </div>

            <nav className="fixed top-[5px] left-0 right-0 z-[100] flex items-center justify-between px-7 py-3 bg-oscuro/95 backdrop-blur-md border-b border-white/5">
                <div className="font-[900] text-[13px] tracking-[3px] uppercase text-amarillo font-barlow-condensed">
                    ✧ VII Congreso · 2026
                </div>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    {count > 0 && (
                        <div className="font-[700] text-[12px] bg-rojo text-white px-3 py-1 font-barlow-condensed">
                            {count} inscrito{count !== 1 ? "s" : ""}
                        </div>
                    )}
                    <Link
                        href="/admin/login"
                        className="font-[700] text-[12px] tracking-[2px] uppercase bg-transparent border border-white/15 text-crema/45 px-4 py-2 cursor-pointer transition-all duration-250 hover:border-amarillo hover:text-amarillo font-barlow-condensed"
                    >
                        Panel Admin ⚙
                    </Link>
                </div>
            </nav>
        </>
    );
}
