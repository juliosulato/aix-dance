"use client"

import { Button, Modal, Stepper } from "@mantine/core";
import { useTranslations } from "next-intl";
import 'dayjs/locale/br';
import { useState } from "react";
import AboutOfClass from "./aboutOfClass";
import DayOfClassesAndHours from "./dayOfClassAndHours";

type Props = {
    opened: boolean;
    onClose?: () => void;
}

function NewClass({ opened, onClose }: Props) {
    const t = useTranslations("");
  const [active, setActive] = useState(1);
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));


    return (
        <Modal opened={opened} onClose={onClose} title={t("classes-modals.titles.create")} size="auto" radius="lg" centered classNames={{ title: "!font-semibold", header: "!pb-2 !pt-4 !px-6 4 !mb-4 border-b border-b-neutral-300" }}>
            <form className="flex flex-col gap-4 md:gap-6 lg:gap-8 max-w-[60vw] lg:p-6" >
                <Stepper active={active} onStepClick={setActive}>
                    <Stepper.Step>
                        <AboutOfClass/>
                        <DayOfClassesAndHours/>
                    </Stepper.Step>
                </Stepper>
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

export default NewClass;