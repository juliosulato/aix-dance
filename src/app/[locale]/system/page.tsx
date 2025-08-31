"use client";

import NewClass from "@/components/(academic)/(class)/newClass";
import NewPlan from "@/components/(academic)/(plans)/newPlan";
import NewStudent from "@/components/(academic)/(students)/newStudent";

export default async function Sistema() {
    return (
        <main>
            <NewClass opened onClose={() => null} />
        </main>
    )
}