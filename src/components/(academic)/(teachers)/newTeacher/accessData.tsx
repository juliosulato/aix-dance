import { PasswordInput, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";

export default function NewTeacher__AccessData() {
    const t = useTranslations("teachers.modals.create.accessData");
    const g = useTranslations("forms.general-fields");

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2">
            <h2 className="text-lg font-bold md:col-span-2">{t("title")}</h2>
            <TextInput
                id="user"
                name="user"
                withAsterisk
                required
                prefix="@"
                label={t("fields.user.label")}
                placeholder={t("fields.user.placeholder")}
                className="md:col-span-2"
            />

            <PasswordInput
                id="password"
                name="password"
                withAsterisk
                required
                label={t("fields.password.label")}
            />
            <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                withAsterisk
                required
                label={t("fields.confirmPassword.label")}
            />
        </div>
    )
}