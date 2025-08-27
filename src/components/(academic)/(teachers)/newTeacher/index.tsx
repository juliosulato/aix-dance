"use client"

import { Button, Modal, Stepper } from "@mantine/core";
import { useTranslations } from "next-intl";
import NewTeacher__AvatarUpload from "./avatarUpload";
import NewTeacher__PersonalData from "./personalData";
import NewTeacher__Address from "./address";

import dayjs from "dayjs";
dayjs.locale("pt-BR");
import 'dayjs/locale/pt-br';
import NewTeacher__AccessData from "./accessData";
import NewTeacher__RemunerationData from "./remuneration";
import { useState } from "react";

type Props = {
    opened: boolean;
    onClose?: () => void;
}

function NewTeacher({ opened, onClose }: Props) {
    const t = useTranslations();
    const [active, setActive] = useState(0);
    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    return (
        <Modal opened={opened} onClose={onClose} title={t("students-modals.titles.create")} size="auto" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
            <form className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6">
                <Stepper active={active} onStepClick={setActive}>
                    <Stepper.Step>
                        <div className="flex flex-col gap-4">
                            <NewTeacher__AvatarUpload />
                            <NewTeacher__PersonalData />
                            <NewTeacher__Address />
                            <div className="flex flex-col md:flex-row items-end justify-end">
                                <Button
                                    type="button"
                                    color="#7439FA"
                                    radius={"lg"}
                                    size="lg"
                                    fullWidth={false}
                                    onClick={nextStep}
                                    className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                                >{t("forms.next")}</Button>
                            </div>
                        </div>
                    </Stepper.Step>
                    <Stepper.Step>
                        <NewTeacher__AccessData />
                        <br />
                        <NewTeacher__RemunerationData />
                        <br />
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <Button
                                type="button"
                                color="#7439FA"
                                radius={"lg"}
                                size="lg"
                                fullWidth={false}
                                onClick={prevStep}
                                className="!text-sm !font-medium tracking-wider w-full md:!w-fit"
                            >{t("forms.prev")}</Button>
                            <Button
                                type="submit"
                                color="#7439FA"
                                radius={"lg"}
                                size="lg"
                                fullWidth={false}
                                className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
                            >{t("forms.submit")}</Button>

                        </div>
                    </Stepper.Step>
                </Stepper>
            </form>
        </Modal>
    )
}
export default NewTeacher