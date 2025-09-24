"use client";

import { ActionIcon, Checkbox, CloseIcon, Tooltip } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IoAdd } from "react-icons/io5";
import {
  FieldErrors,
  UseFormSetValue,
  WatchInternal,
} from "react-hook-form";
import {
  CreateClassInput,
  UpdateClassInput,
} from "@/schemas/academic/class.schema";

type TimeRange = { from: string; to: string };
type DaySchedules = CreateClassInput["schedules"];
type DayKey = keyof DaySchedules;

type Props = {
  errors: FieldErrors<CreateClassInput | UpdateClassInput>;
  setValue: UseFormSetValue<CreateClassInput | UpdateClassInput>;
  watch: WatchInternal<CreateClassInput | UpdateClassInput>;
};

export default function DayOfClassesAndHours({
  errors,
  setValue,
  watch,
}: Props) {
  const days: { key: DayKey; label: string }[] = [
    { key: "sunday", label: "Domingo" },
    { key: "monday", label: "Segunda-feira" },
    { key: "tuesday", label: "Terça-feira" },
    { key: "wednesday", label: "Quarta-feira" },
    { key: "thursday", label: "Quinta-feira" },
    { key: "friday", label: "Sexta-feira" },
    { key: "saturday", label: "Sábado" },
  ];

  const schedules = watch("schedules");

  const handleCheckbox = (dayKey: DayKey, checked: boolean) => {
    setValue(`schedules.${dayKey}.enabled`, checked, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleChange = (
    dayKey: DayKey,
    index: number,
    field: "from" | "to",
    value: string
  ) => {
    // Usando o caminho completo para a atualização
    setValue(`schedules.${dayKey}.ranges.${index}.${field}`, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleAddRange = (dayKey: DayKey) => {
    const currentRanges = schedules?.[dayKey]?.ranges || [];
    setValue(
      `schedules.${dayKey}.ranges`,
      [...currentRanges, { from: "", to: "" }],
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const handleRemoveRange = (dayKey: DayKey, index: number) => {
    const currentRanges = schedules?.[dayKey]?.ranges || [];
    const newRanges = currentRanges.filter((_: any, i: number) => i !== index);
    setValue(
      `schedules.${dayKey}.ranges`,
      newRanges.length ? newRanges : [{ from: "", to: "" }], // Mantém um item vazio se for o último
      { shouldValidate: true, shouldDirty: true }
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col">
      <h2 className="text-lg font-bold">{"Dias e Horários"}</h2>
      {errors.schedules && !errors.schedules.root && (
        <p className="text-sm text-red-500 mt-1">{errors.schedules.message}</p>
      )}
      <br />
      <div className="flex flex-col gap-4 w-full">
        {days.map((day) => (
          <div key={day.key} className="flex flex-col gap-2">
            {schedules?.[day.key]?.ranges.map(
              (range: TimeRange, index: number) => (
                <div
                  key={index}
                  className="flex flex-row flex-wrap gap-4 md:grid md:grid-cols-[1fr__auto__1fr] justify-center items-center"
                >
                  {index === 0 ? (
                    <Checkbox
                      label={day.label}
                      id={day.key}
                      checked={schedules?.[day.key]?.enabled || false}
                      onChange={(e) =>
                        handleCheckbox(day.key, e.currentTarget.checked)
                      }
                    />
                  ) : (
                    <div />
                  )}

                  <div className="flex flex-row gap-3 justify-center items-center">
                    <span>{"De"}</span>
                    <TimeInput
                      value={range.from}
                      disabled={!schedules?.[day.key]?.enabled}
                      onChange={(event) =>
                        handleChange(
                          day.key,
                          index,
                          "from",
                          event.currentTarget.value
                        )
                      }
                      // Exibe a mensagem de erro específica para este campo
                      error={
                        errors.schedules?.[day.key]?.ranges?.[index]?.from
                          ?.message
                      }
                    />
                    <span>{"Até"}</span>
                    <TimeInput
                      value={range.to}
                      disabled={!schedules?.[day.key]?.enabled}
                      onChange={(event) =>
                        handleChange(
                          day.key,
                          index,
                          "to",
                          event.currentTarget.value
                        )
                      }
                      // Exibe a mensagem de erro específica para este campo
                      error={
                        errors.schedules?.[day.key]?.ranges?.[index]?.to
                          ?.message
                      }
                    />
                  </div>

                  <div className="justify-self-end flex gap-2">
                    {schedules?.[day.key]?.ranges.length > 1 && (
                      <Tooltip color="#7439FA" label="Excluir">
                        <ActionIcon
                          color="gray"
                          onClick={() => handleRemoveRange(day.key, index)}
                        >
                          <CloseIcon />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {index === schedules?.[day.key]?.ranges.length - 1 && (
                      <Tooltip color="#7439FA" label="Adicionar">
                        <ActionIcon
                          color="gray"
                          onClick={() => handleAddRange(day.key)}
                          disabled={!schedules?.[day.key]?.enabled}
                        >
                          <IoAdd />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
