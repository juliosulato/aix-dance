"use client";
import {  TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { CreateStudentFormData } from "@/schemas/studentSchema";

type Props = {
    register: UseFormRegister<CreateStudentFormData>;
    errors: FieldErrors<CreateStudentFormData>;
}

export default function Address({  errors, register }: Props) {
    const f = useTranslations("forms.address");

  return (
    <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
      <h2 className="text-lg font-bold md:col-span-2 lg:col-span-3 3xl:col-span-4">{f("title")}</h2>

      <TextInput
        label={f("publicPlace.label")}
        {...register("address.publicPlace")}
        error={errors.address?.publicPlace?.message}
      />

      <TextInput
        label={f("number.label")}
        {...register("address.number")}
        error={errors.address?.number?.message}
      />

      <TextInput
        label={f("complement.label")}
        {...register("address.complement")}
        error={errors.address?.complement?.message}
      />

      <TextInput
        label={f("neighborhood.label")}
        {...register("address.neighborhood")}
        error={errors.address?.neighborhood?.message}
      />

      <TextInput
        label={f("zipCode.label")}
        {...register("address.zipCode")}
        error={errors.address?.zipCode?.message}
      />

      <TextInput
        label={f("city.label")}
        {...register("address.city")}
        error={errors.address?.city?.message}
      />

      <TextInput
        label={f("state.label")}
        {...register("address.state")}
        error={errors.address?.state?.message}
      />
    </div>
  );
}