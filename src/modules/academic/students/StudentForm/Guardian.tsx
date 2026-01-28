import { useFieldArray, Controller } from "react-hook-form";
import { ActionIcon, Button, TextInput } from "@mantine/core";
import { PhoneInput } from "@/components/CellPhoneInput";
import { Control, FieldErrors } from "react-hook-form";
import { CreateStudentFormData } from "@/schemas/academic/student.schema";
import DocumentInput from "@/components/ui/documentInput";
import { BiTrash } from "react-icons/bi";
import { UpdateStudentInput } from "@/schemas/academic/student.schema";
import { memo } from "react";

type Props = {
    control: Control<CreateStudentFormData | UpdateStudentInput>;
    errors: FieldErrors<CreateStudentFormData | UpdateStudentInput>;
};

function NewStudent__Guardians({ control }: Props) {

  const { fields, append, remove } = useFieldArray({
    control,
    name: "guardian",
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col gap-4">
      <h2 className="text-lg font-bold">{"Responsáveis"}</h2>
      <Button
        onClick={() =>
          append({
            firstName: "",
            lastName: "",
            relationship: "",
            phoneNumber: "",
            phoneNumber: "",
            email: "",
            nationalId: "",
          })
        }
        type="button"
        color="#7439FA"
        radius="lg"
        size="lg"
        className="text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto"
      >
        {"Adicionar Responsável"}
      </Button>

      {fields.map((field, index) => (
        <div key={field.id} className={`grid md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4 md:gap-6 py-6 ${index > 0 && "border-t border-t-neutral-300"}`}>
         <div className="flex flex-row flex-wrap justify-between items-center md:col-span-2 lg:col-span-3 3xl:col-span-4">
           <h2 className="text-base font-bold ">
            {"Responsável"} {index + 1}
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
              <TextInput label={"Primeiro Nome"} placeholder={"Digite aqui Nome"} {...field} required/>
            )}
          />

          <Controller
            name={`guardian.${index}.lastName`}
            control={control}
            render={({ field }) => (
              <TextInput label={"Sobrenome"} placeholder={"Digite aqui Sobrenome"} {...field} required/>
            )}
          />

          <Controller
            name={`guardian.${index}.relationship`}
            control={control}
            render={({ field }) => <TextInput label={"Relação"} {...field} placeholder={"Digite aqui Relação"} required/>}
          />

          <Controller
            name={`guardian.${index}.phoneNumber`}
            control={control}
            render={({ field }) => <PhoneInput label={"Celular"} {...field} required/>}
          />

          <Controller
            name={`guardian.${index}.phoneNumber`}
            control={control}
            render={({ field }) => <PhoneInput label={"Telefone"} {...field} required/>}
          />

          <Controller
            name={`guardian.${index}.email`}
            control={control}
            render={({ field }) => <TextInput label={"Email"} type="email" {...field} required/>}
          />

          <Controller
            name={`guardian.${index}.nationalId`}
            control={control}
            render={({ field }) => <DocumentInput {...field} />}
          />
        </div>
      ))}
    </div>
  );
}

export default memo(NewStudent__Guardians);