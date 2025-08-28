"use client";

import NewPlan from "@/components/(academic)/(plans)/newPlan";
import NewStudent from "@/components/(academic)/(students)/newStudent";

export default async function Sistema() {
    return (
        <main>
            <NewPlan opened onClose={() => null} />
        </main>
    )
}