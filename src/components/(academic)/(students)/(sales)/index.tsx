import { Tabs } from "@mantine/core";
import { useState } from "react";
import PointOfSale from "./point-of-sale";
import StudentSalesHistory from "./list";
import { StudentComplete } from "@/types/student.types";

export default function Sales({ student }: { student: StudentComplete }) {
    const [selectedTab, setSelectedTab] = useState<string>("pdv");
    return (
        <div className="bg-neutral-100 p-4 md:p-6 lg:p-8 rounded-2xl border-neutral-200 border mt-4! md:mt-6! ">
            <Tabs
                value={selectedTab}
                onChange={(val) => setSelectedTab(val || "")}
                keepMounted={false}
                variant="pills"
                classNames={{ tab: "!px-6 !py-4 font-medium! !rounded-2xl", root: "p-1!" }}
            >
                <Tabs.List
                    justify="flex-end"
                >
                    <Tabs.Tab value="pdv">PDV</Tabs.Tab>
                    <Tabs.Tab value="history">Histórico</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="pdv">
                    <PointOfSale studentId={student.id} />
                </Tabs.Panel>
                <Tabs.Panel value="history">
                    <StudentSalesHistory studentId={student.id} tenantId={student.tenantId}/>
                </Tabs.Panel>
            </Tabs>
        </div>
    )
}