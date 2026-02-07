import { getUsuarios } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import { PersonalContent } from "./PersonalContent";
import { redirect } from "next/navigation";

export default async function PersonalPage() {
    const session = await getSession();
    if (!session || (session.user.rol !== "ADMINISTRADOR" && session.user.rol !== "COORDINADOR")) {
        redirect("/dashboard");
    }

    const personal = await getUsuarios();

    return (
        <PersonalContent
            session={session}
            initialPersonal={personal}
        />
    );
}
