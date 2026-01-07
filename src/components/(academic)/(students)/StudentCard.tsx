import { StudentComplete } from "@/types/student.types";
import { Avatar, Text, Tooltip } from "@mantine/core";
import { RowActionMenu } from "./RowActionMenu";
import dayjs from "dayjs";

type Props = {
    item: StudentComplete;
    handleUpdate: (item: StudentComplete) => void;
    handleDelete: (item: StudentComplete) => void;
}
export default function StudentCard({ item, handleDelete, handleUpdate }: Props) {
    return (
         <div className="flex flex-col gap-3 p-4">
            <div className="flex flex-row justify-between items-start">
              <div className="flex items-center gap-4">
                <Avatar
                  src={item.image}
                  name={item.firstName}
                  color="#7439FA"
                  size="64px"
                  radius="16px"
                />
                <div>
                  <Text fw={700} size="lg" className="leading-tight">
                    {`${item.firstName} ${item.lastName}`}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Matrícula: {dayjs(item.createdAt).format("DD/MM/YYYY")}
                  </Text>
                </div>
              </div>
              <RowActionMenu
                student={item}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </div>

            
            <div className="mt-2 pl-2 border-l-2 border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Text size="sm" fw={500} className="w-24">
                  Turmas:
                </Text>
                <Text size="sm" c="dimmed">
                  {item.classes &&
                  Array.isArray(item.classes) &&
                  item.classes.length > 0
                    ? item.classes.map((c) => c.name).join(", ")
                    : "Nenhuma turma"}
                </Text>
              </div>

              <div className="flex items-center gap-2">
                <Text size="sm" fw={500} className="w-24">
                  Frequência:
                </Text>

                {(item.attendanceAverage ?? 0) === 0 ? (
                  <Text size="sm" c="dimmed">
                    -
                  </Text>
                ) : (item.attendanceAverage ?? 0) < 50 ? (
                  <Text size="sm" fw={700} className="text-red-500">
                    {item.attendanceAverage}%
                  </Text>
                ) : (item.attendanceAverage ?? 0) < 75 ? (
                  <Text size="sm" fw={700} className="text-yellow-500">
                    {item.attendanceAverage}%
                  </Text>
                ) : (
                  <Text size="sm" fw={700} className="text-green-500">
                    {item.attendanceAverage}%
                  </Text>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Text size="sm" fw={500} className="w-24">
                  WhatsApp:
                </Text>
                <a
                  href={`https://wa.me/${item.cellPhoneNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-500 hover:underline text-sm"
                >
                  {item.cellPhoneNumber}
                </a>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Text size="sm" fw={500} className="w-24">
                  Status:
                </Text>
                {item.active}
                {(() => {
                  if (item.active) {
                    return (
                      <Tooltip label={"Ativo"} color="green">
                        <div
                          className={`w-4 h-4 rounded-full bg-green-500`}
                        ></div>
                      </Tooltip>
                    );
                  } else {
                    return (
                      <Tooltip label={"Inativo"} color="red">
                        <div
                          className={`w-4 h-4 rounded-full bg-red-500`}
                        ></div>
                      </Tooltip>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
    )
}