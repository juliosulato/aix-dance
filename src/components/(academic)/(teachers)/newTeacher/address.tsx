import {  TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
export default function NewTeacher__Address() {
    const f = useTranslations("forms.address");

    return (

        <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
            <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{f("title")}</h2>

            <TextInput
                label={f("publicPlace.label")}
                id="publicPlace"
                name="publicPlace"
            />

            <TextInput
                label={f("number.label")}
                id="number"
                name="number"
            />
            <TextInput
                label={f("complement.label")}
                id="complement"
                name="complement"
            />

            <TextInput
                label={f("neighborhood.label")}
                id="neighborhood"
                name="neighborhood"
            />
            <TextInput
                label={f("zipCode.label")}
                id="zipCode"
                name="zipCode"
            />
            <br />
            <TextInput
                label={f("city.label")}
                id="city"
                name="city"
            />

            <TextInput
                label={f("state.label")}
                id="state"
                name="state"
            />
        </div>
    )
}