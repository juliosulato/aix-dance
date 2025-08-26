import { MultiSelect } from "@mantine/core";
import { useTranslations } from "next-intl";
import { FaSearch } from "react-icons/fa";
import { Student } from "@prisma/client";
import { useState } from "react";
import Image from "next/image";

import notFound from "@/assets/images/not-found.avif";

export default function NewClass__Students() {
    const t = useTranslations("classes-modals.formSteps.two");
    const g = useTranslations("");

    const [studentsSelected, setStudentsSelected] = useState<Student[]>([])

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("title")}</h2>
            <MultiSelect
                label={t("fields.students.label")}
                id="students"
                name="students"
                placeholder={t("fields.students.placeholder")}
                searchable
                className="!w-full"
                nothingFoundMessage={g("general.notFound")}
                rightSection={<FaSearch />}
            />
            <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4">
                {studentsSelected.length == 0 && (
                    <div className="flex flex-col gap-3 items-center justify-center">
                        <Image src={notFound} alt="" className="max-w-[200px]" />
                        <h2 className="text-2xl text-primary font-bold">Nada por aqui… ainda!</h2>
                        <p className="text-center max-w-[400px]">Você ainda não selecionou nenhum aluno. Assim que selecionar um ou mais, eles vão aparecer aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
}