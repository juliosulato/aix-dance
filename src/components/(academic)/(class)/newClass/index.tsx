"use client"

import { Button, Modal, Stepper } from "@mantine/core";
import { useTranslations } from "next-intl";
import 'dayjs/locale/pt-br';
import { useState } from "react";
import AboutOfClass from "./aboutOfClass";
import DayOfClassesAndHours from "./dayOfClassAndHours";
import NewClass__Students from "./students";
import NewClass__Resume from "./resume";

type Props = {
    opened: boolean;
    onClose: () => void;
}

function NewClass({ opened, onClose }: Props) {
    const t = useTranslations("");
    const [active, setActive] = useState(0);
    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));


    return (
        <Modal opened={opened} onClose={onClose} title={t("classes-modals.titles.create")} size="auto" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
            <form className="flex flex-col gap-4 md:gap-6 lg:gap-8 w-full lg:w-[60vw] lg:p-6" >
                <Stepper active={active} onStepClick={setActive}>
                    <Stepper.Step label={t("classes-modals.formSteps.one.step")} >
                        <div className="flex flex-col gap-4">
                            <AboutOfClass />
                            <DayOfClassesAndHours />
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
                    <Stepper.Step label={t("classes-modals.formSteps.two.step")} >
                        <div className="flex flex-col gap-4">
                            <NewClass__Students />
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
                                    type="button"
                                    color="#7439FA"
                                    radius={"lg"}
                                    size="lg"
                                    fullWidth={false}
                                    onClick={nextStep}
                                    className="!text-sm !font-medium tracking-wider w-full md:!w-fit"
                                >{t("forms.next")}</Button>
                            </div>
                        </div>
                    </Stepper.Step>
                    <Stepper.Step label={t("classes-modals.formSteps.three.step")}>
                        <div className="flex flex-col gap-4">
                            <NewClass__Resume />
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
                                    onClick={nextStep}
                                    className="!text-sm !font-medium tracking-wider w-full md:!w-fit"
                                >{t("forms.submit")}</Button>
                            </div>
                        </div>
                    </Stepper.Step>

                </Stepper>
            </form>
        </Modal>
    )
}

export default NewClass;