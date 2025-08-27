import { Gender } from "@prisma/client";
import { useState } from "react";
import { PhoneInput } from "@/components/ui/cellPhoneInput";
import { Select, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { DateInput } from "@mantine/dates"
import 'dayjs/locale/pt-br';
import DocumentInput from "@/components/ui/documentInput";

export default function NewStudent__PersonalData() {
    const [gender, setGender] = useState<Gender | null>(null);
    const t = useTranslations("students-modals.forms.personalData");
    const g = useTranslations("forms.general-fields");

    return (

        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("title")}</h2>
            <TextInput
                label={g("firstName.label")}
                id="firstName"
                name="firstName"
                required
                withAsterisk
                placeholder={g("firstName.placeholder")}
            />
            <TextInput
                label={g("lastName.label")}
                id="lastName"
                name="lastName"
                required
                withAsterisk
                placeholder={g("lastName.placeholder")}
            />
            <PhoneInput
                label={g("cellPhoneNumber.label")}
                id="cellPhoneNumber"
                name="cellPhoneNumber"
                required
                withAsterisk
                onChange={() => null}
            />
            <PhoneInput
                label={g("phoneNumber.label")}
                id="phoneNumber"
                name="phoneNumber"
                onChange={() => null}
            />
            <TextInput
                label={g("email.label")}
                id="email"
                name="email"
                required
                withAsterisk
                type="email"
                placeholder={g("email.placeholder")}
            />
            <DateInput
                label={g("dateOfBirth.label")}
                id="dateOfBirth"
                name="dateOfBirth"
                withAsterisk
                placeholder={g("dateOfBirth.placeholder")}
                valueFormat={g("dateOfBirth.valueFormat")}
                locale="pt-br"
            />
            <DocumentInput />
            <Select
                label={g("gender.label")}
                id="gender"
                name="gender"
                withAsterisk
                placeholder={g("gender.placeholder")}
                data={[
                    { label: "Mulher", value: Gender.FEMALE },
                    { label: "Homem", value: Gender.MALE },
                    { label: "Não binário", value: Gender.NON_BINARY },
                    { label: "Outro", value: Gender.OTHER },
                ]}
                onChange={(val: any) => setGender(val)}
            />
            {gender && (gender == "NON_BINARY" || gender == 'OTHER') && (
                <TextInput
                    label={g("pronoun.label")}
                    id="pronoun"
                    name="pronoun"
                    withAsterisk
                    placeholder={g("pronoun.placeholder")}
                    required
                />
            )}
            <Select
                label={t("howDidYouMeetUs.label")}
                id="howDidYouMeetUs"
                name="howDidYouMeetUs"
                placeholder={t("howDidYouMeetUs.placeholder")}
                data={[
                    { label: "Instagram", value: "instagram" },
                    { label: "Facebook", value: "facebook" },
                    { label: "Tiktok", value: "tiktok" },
                    { label: "Google", value: "google" },
                    { label: "Indicação", value: "indicacao" },
                    { label: "Outro", value: "outro" },
                ]}
            />
            <TextInput
                label={g("instagramUser.label")}
                id="instagramUser"
                name="instagramUser"
                placeholder={g("instagramUser.placeholder")}
            />
        </div>
    )
}