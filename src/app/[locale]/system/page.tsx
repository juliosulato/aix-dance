"use client";

import NewBill from "@/components/(financial)/(bills)/newBill";

export default async function Sistema() {
    return (
        <main>
            <NewBill opened onClose={() => null} onSuccess={() => null}/>
        </main>
    )
}