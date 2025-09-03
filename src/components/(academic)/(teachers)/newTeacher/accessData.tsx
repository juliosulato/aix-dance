import { CreateUserInput } from "@/schemas/user.schema";
import { PasswordInput, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";

type Props = {
    control: Control<CreateUserInput>;
    errors: FieldErrors<CreateUserInput>;
    register: UseFormRegister<CreateUserInput>;
};

export default function NewTeacher__AccessData({ control, errors, register }: Props) {
    const t = useTranslations("teachers.modals.create.accessData");
    const g = useTranslations("forms.general-fields");

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2">
            <h2 className="text-lg font-bold md:col-span-2">{t("title")}</h2>
            <TextInput
                required
                prefix="@"
                label={t("fields.user.label")}
                placeholder={t("fields.user.placeholder")}
                className="md:col-span-2"
                {...register("user")}
                error={errors.user?.message}
            />

            <Controller
                control={control}
                name="password"
                render={({ field }) => (
                    <PasswordInput
                        id="password"
                        name="password"
                        required
                        label={t("fields.password.label")}
                        error={errors.password?.message}
                        value={field.value}
                        onChange={field.onChange}
                    />
                )}
            />

            <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                    <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        label={t("fields.confirmPassword.label")}
                        error={errors.confirmPassword?.message}
                        value={field.value}
                        onChange={field.onChange}
                    />
                )}
            />

        </div>
    )
}