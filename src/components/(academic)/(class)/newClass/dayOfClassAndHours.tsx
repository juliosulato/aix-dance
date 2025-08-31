"use client";

import { ActionIcon, Checkbox, CloseIcon, Tooltip } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useTranslations } from "next-intl";
import { IoAdd } from "react-icons/io5";
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, WatchInternal } from "react-hook-form";
import { CreateClassInput } from "@/schemas/class.schema";
import { Key } from "react";

type TimeRange = { from: string; to: string };
type DaySchedules = CreateClassInput["schedules"];
type DayKey = keyof DaySchedules;

type Props = {
  control: Control<CreateClassInput>;
  errors: FieldErrors<CreateClassInput>;
  register: UseFormRegister<CreateClassInput>;
  setValue: UseFormSetValue<CreateClassInput>;
  watch: WatchInternal<CreateClassInput>;
};

export default function NewClass__DayOfClassesAndHours({
  control,
  errors,
  register,
  setValue,
  watch,
}: Props) {
  const t = useTranslations("classes-modals.formSteps.one.classDaysAndHours");
  const g = useTranslations("");

  const days: { key: DayKey; label: string }[] = [
    { key: "sunday", label: t("days.sunday") },
    { key: "monday", label: t("days.monday") },
    { key: "tuesday", label: t("days.tuesday") },
    { key: "wednesday", label: t("days.wednesday") },
    { key: "thursday", label: t("days.thursday") },
    { key: "friday", label: t("days.friday") },
    { key: "saturday", label: t("days.saturday") },
  ];

  const schedules = watch("schedules");

  const handleCheckbox = (dayKey: DayKey, checked: boolean) => {
    setValue(`schedules.${dayKey}.enabled`, checked, { shouldDirty: true });
  };

  const handleChange = (
    dayKey: DayKey,
    index: number,
    field: "from" | "to",
    value: string
  ) => {
    const newRanges = schedules[dayKey].ranges.map((r: any, i: number) =>
      i === index ? { ...r, [field]: value } : r
    );
    setValue(`schedules.${dayKey}.ranges`, newRanges, { shouldDirty: true });
  };

  const handleAddRange = (dayKey: DayKey) => {
    setValue(
      `schedules.${dayKey}.ranges`,
      [...schedules[dayKey].ranges, { from: "", to: "" }],
      { shouldDirty: true }
    );
  };

  const handleRemoveRange = (dayKey: DayKey, index: number) => {
    const newRanges = schedules[dayKey].ranges.filter((_: any, i: number) => i !== index);
    setValue(
      `schedules.${dayKey}.ranges`,
      newRanges.length ? newRanges : [{ from: "", to: "" }],
      { shouldDirty: true }
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col">
      <h2 className="text-lg font-bold">{t("title")}</h2>
      <br />
      <div className="flex flex-col gap-4 w-full">
        {days.map((day) => (
          <div key={day.key} className="flex flex-col gap-2">
            {schedules[day.key].ranges.map((range: TimeRange, index: number) => (
              <div
                key={index}
                className="flex flex-row flex-wrap gap-4 md:grid md:grid-cols-[1fr__auto__1fr] justify-center items-center"
              >
                {index === 0 ? (
                  <Checkbox
                    label={day.label}
                    id={day.key}
                    checked={schedules[day.key].enabled}
                    onChange={(e) =>
                      handleCheckbox(day.key, e.currentTarget.checked)
                    }
                  />
                ) : (
                  <div />
                )}

                <div className="flex flex-row gap-3 justify-center items-center">
                  <span>{t("hours.from")}</span>
                  <TimeInput
                    value={range.from}
                    disabled={!schedules[day.key].enabled}
                    onChange={(event) =>
                      handleChange(day.key, index, "from", event.currentTarget.value)
                    }
                  />
                  <span>{t("hours.to")}</span>
                  <TimeInput
                    value={range.to}
                    disabled={!schedules[day.key].enabled}
                    onChange={(event) =>
                      handleChange(day.key, index, "to", event.currentTarget.value)
                    }
                  />
                </div>

                <div className="justify-self-end flex gap-2">
                  {schedules[day.key].ranges.length > 1 && (
                    <Tooltip color="#7439FA" label={g("general.actions.delete")}>
                      <ActionIcon
                        color="gray"
                        onClick={() => handleRemoveRange(day.key, index)}
                      >
                        <CloseIcon />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  {index === schedules[day.key].ranges.length - 1 && (
                    <Tooltip color="#7439FA" label={g("general.actions.add")}>
                      <ActionIcon
                        color="gray"
                        onClick={() => handleAddRange(day.key)}
                      >
                        <IoAdd />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
