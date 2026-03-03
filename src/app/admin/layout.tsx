import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Panel · VII Congreso CVC 2026",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="min-h-screen bg-[#0a130a]">{children}</div>;
}
