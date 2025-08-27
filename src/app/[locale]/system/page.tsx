"use client";

import NewStudent from "@/components/(academic)/(students)/newStudent";

export default async function Sistema() {
    return (
        <main>
            <NewStudent opened onClose={() => null} />
        </main>
    )
}