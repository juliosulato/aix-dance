import { CreateUserInput, UpdateUserInput } from "@/schemas/user.schema";
import { PasswordInput, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { Control, Controller, FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";

type Props = {
    control: Control<CreateUserInput | UpdateUserInput>;
    errors: FieldErrors<CreateUserInput | UpdateUserInput>;
    watch: UseFormWatch<CreateUserInput | UpdateUserInput>;
};

export default function Teacher__AccessData({ control, errors, watch }: Props) {
    const t = useTranslations("academic.teachers.modals.create.accessData");

    const email = watch("email");

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2">
            <h2 className="text-lg font-bold md:col-span-2">{t("title")}</h2>
            <TextInput
                prefix="@"
                label={"Email"}
                className="md:col-span-2"
                disabled
                value={email}
            />

            <Controller
                control={control}
                name="password"
                render={({ field }) => (
                    <PasswordInput
                        {...field}
                        required
                        label={t("fields.password.label")}
                        error={errors.password?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                    <PasswordInput
                        {...field}
                        required
                        label={t("fields.confirmPassword.label")}
                        error={errors.confirmPassword?.message}
                    />
                )}
            />

        </div>
    )
}
