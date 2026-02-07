import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground relative selection:bg-primary/20">
            {/* Global Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-slate-200/40 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-overlay dark:bg-slate-900/10 animate-blob" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gray-200/40 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-overlay dark:bg-gray-900/10 animate-blob animation-delay-2000" />
                <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-slate-100/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-overlay dark:bg-slate-800/10 animate-blob animation-delay-4000" />
            </div>

            <Sidebar session={session} />
            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                <Navbar session={session} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
                    <div className="max-w-full mx-auto space-y-8 animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
