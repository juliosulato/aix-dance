"use client";

import NewTeacher from "@/components/(academic)/(teachers)/newTeacher";

export default async function Sistema() {
    return (
        <main>
            <NewTeacher opened onClose={() => null} />
        </main>
    )
}