import InfoTerm from "@/components/ui/Infoterm";

interface Day {
  dayOfWeek: string;
  initialHour: string;
  endHour: string;
}

interface ClassScheduleProps {
  days: Day[];
}

const dayNames: Record<string, string> = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

export function ClassSchedule({ days }: ClassScheduleProps) {
  if (!days || days.length === 0) {
    return (
      <>
        <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">
          Dias e Horários
        </h2>
        <InfoTerm label="Dias e Horários das Aulas">
          Nenhum horário definido
        </InfoTerm>
      </>
    );
  }

  const groupedDays = days.reduce((acc, day) => {
    const dayKey = day.dayOfWeek.toLowerCase();
    if (!acc[dayKey]) {
      acc[dayKey] = {
        day: dayNames[dayKey] || dayKey,
        ranges: [],
      };
    }
    acc[dayKey].ranges.push(`${day.initialHour} - ${day.endHour}`);
    return acc;
  }, {} as Record<string, { day: string; ranges: string[] }>);

  return (
    <>
      <h2 className="text-lg font-semibold border-b border-b-neutral-300 pb-2 my-4">
        Dias e Horários
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(groupedDays).map((dayInfo) => (
          <InfoTerm key={dayInfo.day} label={dayInfo.day}>
            {dayInfo.ranges.join(", ")}
          </InfoTerm>
        ))}
      </div>
    </>
  );
}
