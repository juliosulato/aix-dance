"use client";

import { ActionIcon, Checkbox, CloseIcon, Tooltip } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IoAdd } from "react-icons/io5";
import {
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  CreateClassInput,
  UpdateClassInput,
  DAYS_OF_WEEK,
} from "@/schemas/academic/class.schema";

type Props = {
  errors: FieldErrors<CreateClassInput | UpdateClassInput>;
  setValue: UseFormSetValue<CreateClassInput | UpdateClassInput>;
  watch: UseFormWatch<CreateClassInput | UpdateClassInput>;
};

type DayConfig = {
  key: DAYS_OF_WEEK;
  label: string;
};

const DAYS: readonly DayConfig[] = [
  { key: DAYS_OF_WEEK.SUNDAY, label: "Domingo" },
  { key: DAYS_OF_WEEK.MONDAY, label: "Segunda-feira" },
  { key: DAYS_OF_WEEK.TUESDAY, label: "Terça-feira" },
  { key: DAYS_OF_WEEK.WEDNESDAY, label: "Quarta-feira" },
  { key: DAYS_OF_WEEK.THURSDAY, label: "Quinta-feira" },
  { key: DAYS_OF_WEEK.FRIDAY, label: "Sexta-feira" },
  { key: DAYS_OF_WEEK.SATURDAY, label: "Sábado" },
] as const;

/**
 * DaySchedules Component
 * Manages class schedules for each day of the week
 * Follows SRP by only handling schedule management
 */
export default function DaySchedules({ errors, setValue, watch }: Props) {
  const days = watch("days") || [];

  /**
   * Get schedules for a specific day
   */
  const getDaySchedules = (dayOfWeek: DAYS_OF_WEEK) => {
    return days.filter((d) => d.dayOfWeek === dayOfWeek);
  };

  /**
   * Check if a day has any schedule
   */
  const isDayEnabled = (dayOfWeek: DAYS_OF_WEEK) => {
    return getDaySchedules(dayOfWeek).length > 0;
  };

  /**
   * Toggle day enabled/disabled
   */
  const handleCheckbox = (dayOfWeek: DAYS_OF_WEEK, checked: boolean) => {
    if (checked) {
      // Add one empty schedule for this day
      setValue("days", [...days, { dayOfWeek, initialHour: "", endHour: "" }], {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      // Remove all schedules for this day
      setValue(
        "days",
        days.filter((d) => d.dayOfWeek !== dayOfWeek),
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );
    }
  };

  /**
   * Update time value
   */
  const handleChange = (
    dayOfWeek: DAYS_OF_WEEK,
    index: number,
    field: "initialHour" | "endHour",
    value: string
  ) => {
    const daySchedules = getDaySchedules(dayOfWeek);
    const globalIndex = days.findIndex(
      (d, i) => d.dayOfWeek === dayOfWeek && daySchedules.indexOf(d) === index
    );

    if (globalIndex !== -1) {
      const newDays = [...days];
      newDays[globalIndex] = { ...newDays[globalIndex], [field]: value };
      setValue("days", newDays, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  /**
   * Add new time schedule to a day
   */
  const handleAddSchedule = (dayOfWeek: DAYS_OF_WEEK) => {
    setValue(
      "days",
      [...days, { dayOfWeek, initialHour: "", endHour: "" }],
      { shouldValidate: true, shouldDirty: true }
    );
  };

  /**
   * Remove time schedule from a day
   */
  const handleRemoveSchedule = (dayOfWeek: DAYS_OF_WEEK, index: number) => {
    const daySchedules = getDaySchedules(dayOfWeek);
    const scheduleToRemove = daySchedules[index];
    
    setValue(
      "days",
      days.filter((d) => d !== scheduleToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 border border-neutral-300 rounded-2xl flex flex-col">
      <h2 className="text-lg font-bold">Dias e Horários</h2>
      {errors.days && (
        <p className="text-sm text-red-500 mt-1">
          {Array.isArray(errors.days) 
            ? "Verifique os horários preenchidos" 
            : (errors.days as any)?.message || "É necessário fornecer pelo menos um dia de aula"}
        </p>
      )}
      <br />
      <div className="flex flex-col gap-4 w-full">
        {DAYS.map((day) => (
          <DayScheduleRow
            key={day.key}
            day={day}
            schedules={getDaySchedules(day.key)}
            isEnabled={isDayEnabled(day.key)}
            errors={errors}
            onCheckboxChange={handleCheckbox}
            onTimeChange={handleChange}
            onAddSchedule={handleAddSchedule}
            onRemoveSchedule={handleRemoveSchedule}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * DayScheduleRow Component
 * Renders a single day's schedule with time ranges
 * Separated for better readability and maintainability
 */
type DayScheduleRowProps = {
  day: DayConfig;
  schedules: Array<{
    dayOfWeek: DAYS_OF_WEEK;
    initialHour: string;
    endHour: string;
  }>;
  isEnabled: boolean;
  errors: FieldErrors<CreateClassInput | UpdateClassInput>;
  onCheckboxChange: (dayOfWeek: DAYS_OF_WEEK, checked: boolean) => void;
  onTimeChange: (
    dayOfWeek: DAYS_OF_WEEK,
    index: number,
    field: "initialHour" | "endHour",
    value: string
  ) => void;
  onAddSchedule: (dayOfWeek: DAYS_OF_WEEK) => void;
  onRemoveSchedule: (dayOfWeek: DAYS_OF_WEEK, index: number) => void;
};

function DayScheduleRow({
  day,
  schedules,
  isEnabled,
  errors,
  onCheckboxChange,
  onTimeChange,
  onAddSchedule,
  onRemoveSchedule,
}: DayScheduleRowProps) {
  // If day is not enabled, show one disabled row
  const displaySchedules = schedules.length > 0 ? schedules : [{ dayOfWeek: day.key, initialHour: "", endHour: "" }];

  return (
    <div className="flex flex-col gap-2">
      {displaySchedules.map((schedule, index) => (
        <div
          key={index}
          className="flex flex-row flex-wrap gap-4 md:grid md:grid-cols-[1fr_auto_1fr] justify-center items-center"
        >
          {/* Day checkbox - only show on first schedule */}
          {index === 0 ? (
            <Checkbox
              label={day.label}
              id={day.key}
              checked={isEnabled}
              onChange={(e) => onCheckboxChange(day.key, e.currentTarget.checked)}
            />
          ) : (
            <div />
          )}

          {/* Time inputs */}
          <div className="flex flex-row gap-3 justify-center items-center">
            <span>De</span>
            <TimeInput
              value={schedule.initialHour}
              disabled={!isEnabled}
              onChange={(event) =>
                onTimeChange(day.key, index, "initialHour", event.currentTarget.value)
              }
            />
            <span>Até</span>
            <TimeInput
              value={schedule.endHour}
              disabled={!isEnabled}
              onChange={(event) =>
                onTimeChange(day.key, index, "endHour", event.currentTarget.value)
              }
            />
          </div>

          {/* Action buttons */}
          <div className="justify-self-end flex gap-2">
            {schedules.length > 1 && (
              <Tooltip color="#7439FA" label="Excluir">
                <ActionIcon
                  color="gray"
                  onClick={() => onRemoveSchedule(day.key, index)}
                >
                  <CloseIcon />
                </ActionIcon>
              </Tooltip>
            )}
            {index === displaySchedules.length - 1 && isEnabled && (
              <Tooltip color="#7439FA" label="Adicionar">
                <ActionIcon
                  color="gray"
                  onClick={() => onAddSchedule(day.key)}
                  disabled={!isEnabled}
                >
                  <IoAdd />
                </ActionIcon>
              </Tooltip>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
