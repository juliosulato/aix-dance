import { PhoneInput } from "@/components/ui/cellPhoneInput";
import { TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import 'dayjs/locale/BR';
import DocumentInput from "@/components/ui/documentInput";

export default function NewStudent__Guardians() {
    const t = useTranslations("students-modals.forms.guardians");
    const g = useTranslations("forms.general-fields");

    return (

        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("title")}</h2>
            <h2 className="text-base font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("guardian")} 1</h2>
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
            <TextInput
                label={t("relationship.label")}
                id="relationship"
                name="relationship"
                required
                withAsterisk
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
            <DocumentInput />
            <hr className="md:col-span-2 lg:col-span-3 3xl:col-span-4 border-neutral-300 my-4"/>
              <h2 className="text-base font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{t("guardian")} 2</h2>
            <TextInput
                label={g("firstName.label")}
                id="firstName"
                name="firstName"
                placeholder={g("firstName.placeholder")}
            />
            <TextInput
                label={g("lastName.label")}
                id="lastName"
                name="lastName"
                placeholder={g("lastName.placeholder")}
            />
            <TextInput
                label={t("relationship.label")}
                id="relationship"
                name="relationship"
            />
            <PhoneInput
                label={g("cellPhoneNumber.label")}
                id="cellPhoneNumber"
                name="cellPhoneNumber"
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
                type="email"
                placeholder={g("email.placeholder")}
            />
            <DocumentInput />
        </div>
    )
}