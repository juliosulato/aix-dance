import { useFieldArray, Controller } from "react-hook-form";
import { ActionIcon, Button, TextInput } from "@mantine/core";
import { PhoneInput } from "@/components/ui/cellPhoneInput";
import { Control, FieldErrors } from "react-hook-form";
import { CreateStudentFormData } from "@/schemas/studentSchema";
import { useTranslations } from "next-intl";
import DocumentInput from "@/components/ui/documentInput";
import { BiTrash } from "react-icons/bi";

type Props = {
  control: Control<CreateStudentFormData>;
  errors: FieldErrors<CreateStudentFormData>;
};

export default function NewStudent__Guardians({ control, errors }: Props) {
  const t = useTranslations("students-modals.forms.guardians");
  const g = useTranslations("forms.general-fields");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "guardian",
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4">
      <h2 className="text-lg font-bold">{t("title")}</h2>
      <Button
        onClick={() =>
          append({
            firstName: "",
            lastName: "",
            relationship: "",
            cellPhoneNumber: "",
            phoneNumber: "",
            email: "",
            documentOfIdentity: "",
          })
        }
        type="button"
        color="#7439FA"
        radius="lg"
        size="lg"
        className="!text-sm !font-medium tracking-wider w-full md:!w-fit ml-auto"
      >
        {t("addGuardian")}
      </Button>

      {fields.map((field, index) => (
        <div key={field.id} className={`grid md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4 md:gap-6 py-6 ${index > 0 && "border-t border-t-neutral-300"}`}>
         <div className="flex flex-row flex-wrap justify-between items-center md:col-span-2 lg:col-span-3 3xl:col-span-4">
           <h2 className="text-base font-bold ">
            {t("guardian")} {index + 1}
          </h2>
          <ActionIcon
            type="button"
            color="red"
            variant="outline"
            onClick={() => remove(index)}
            className="absolute top-2 right-2"
          >
            <BiTrash/>
          </ActionIcon>
         </div>
          <Controller
            name={`guardian.${index}.firstName`}
            control={control}
            render={({ field }) => (
              <TextInput label={g("firstName.label")} placeholder={g("firstName.placeholder")} {...field} required/>
            )}
          />

          <Controller
            name={`guardian.${index}.lastName`}
            control={control}
            render={({ field }) => (
              <TextInput label={g("lastName.label")} placeholder={g("lastName.placeholder")} {...field} required/>
            )}
          />

          <Controller
            name={`guardian.${index}.relationship`}
            control={control}
            render={({ field }) => <TextInput label={t("relationship.label")} {...field} placeholder={t("relationship.placeholder")} required/>}
          />

          <Controller
            name={`guardian.${index}.cellPhoneNumber`}
            control={control}
            render={({ field }) => <PhoneInput label={g("cellPhoneNumber.label")} {...field} required/>}
          />

          <Controller
            name={`guardian.${index}.phoneNumber`}
            control={control}
            render={({ field }) => <PhoneInput label={g("phoneNumber.label")} {...field} />}
          />

          <Controller
            name={`guardian.${index}.email`}
            control={control}
            render={({ field }) => <TextInput label={g("email.label")} type="email" {...field} />}
          />

          <Controller
            name={`guardian.${index}.documentOfIdentity`}
            control={control}
            render={({ field }) => <DocumentInput {...field} />}
          />
        </div>
      ))}
    </div>
  );
}
