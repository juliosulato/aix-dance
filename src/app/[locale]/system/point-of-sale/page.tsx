import { auth } from "@/auth";
import PointOfSale from "@/components/(academic)/(students)/(sales)/point-of-sale";

export default async function PointOfSalePage() {
    const session = await auth();

    
    return (
        <main>
            <PointOfSale tenancyId={session?.user.tenancyId || ""} />
        </main>
    );
}