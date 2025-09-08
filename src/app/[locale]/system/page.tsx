"use client";

import NewBill from "@/components/(financial)/(manager)/modals/NewBill";

export default async function Sistema() {
    return (
        <main>
            <NewBill opened onClose={() => null} onSuccess={() => null}/>
        </main>
    )
}