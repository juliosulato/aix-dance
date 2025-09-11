import { CreateUserInput, UpdateUserInput } from "@/schemas/user.schema";
import { PasswordInput, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";

type Props = {
    control: Control<CreateUserInput | UpdateUserInput>;
    errors: FieldErrors<CreateUserInput | UpdateUserInput>;
    register: UseFormRegister<CreateUserInput | UpdateUserInput>;
};

export default function Teacher__AccessData({ control, errors, register }: Props) {
    const t = useTranslations("teachers.modals.create.accessData");

    return (
        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2">
            <h2 className="text-lg font-bold md:col-span-2">{t("title")}</h2>
            <TextInput
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
