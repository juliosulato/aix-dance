"use client"

import { Button, Modal } from "@mantine/core";
import { useTranslations } from "next-intl";
import 'dayjs/locale/pt-br';
import { useState } from "react";
import AvatarUpload from "./avatarUpload";
import NewStudent__PersonalData from "./personalData";
import NewStudent__Address from "./address";
import NewStudent__Checkboxies from "./checkboxies";
import NewStudent__Guardians from "./guardians";
import { GuardianFormData } from "@/types/studentForm";
import handleSubmit from "./handleSubmit";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
dayjs.locale("pt-br")
type Props = {
    opened: boolean;
    onClose: () => void;
}

function NewStudent({ opened, onClose }: Props) {
    const t = useTranslations(""); 
    const session = useSession();
    
    const [guardians, setGuardians] = useState<GuardianFormData[] | null>(null);

    return (
        <Modal opened={opened} onClose={onClose} title={t("students-modals.titles.create")} size="auto" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
            <form onSubmit={(ev) => {
                ev.preventDefault();
                const formData = new FormData(ev.currentTarget);
                handleSubmit(formData, session.data?.user.tenancyId ?? "", guardians);
            }} className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6" >
                <AvatarUpload />
                <NewStudent__PersonalData />
                <NewStudent__Address />
                <NewStudent__Checkboxies setGuardian={setGuardians} />
                {guardians && <NewStudent__Guardians />}
                <Button
                    type="submit"
                    color="#7439FA"
                    radius={"lg"}
                    size="lg"
                    fullWidth={false}
                    className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                >{t("forms.submit")}</Button>
            </form>
        </Modal>
    )
}
export default NewStudent