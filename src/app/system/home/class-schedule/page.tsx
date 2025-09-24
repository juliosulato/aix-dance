"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader, Text, Paper, Button, Group, Title, Modal, Table } from "@mantine/core";
import { FaPrint, FaTable } from "react-icons/fa";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "dayjs/locale/pt-br";

import FullCalendar from "@fullcalendar/react";
import type { EventClickArg } from "@fullcalendar/core";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale("pt-br");

// Cores para modalidades (pode vir do backend futuramente)
const modalityColors: Record<string, string> = {
  "Ballet": "#7c3aed", // Roxo
  "Hip Hop": "#059669", // Verde
  "Jazz": "#dc2626", // Vermelho
  "Contemporâneo": "#ea580c", // Laranja
  "Sapateado": "#0891b2", // Azul
  "publicPlace Dance": "#7c2d12", // Marrom
  "Dança de Salão": "#be185d", // Rosa
  "Flamenco": "#991b1b", // Vermelho escuro
  "default": "#6b7280", // Cinza para modalidades não mapeadas
};

export default function ClassSchedulePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTablePrint, setShowTablePrint] = useState(false);

  useEffect(() => {
    if (!session?.user?.tenancyId) return;
    setLoading(true);
    // Não precisamos mais de from/to, pois vamos buscar todas as turmas ativas
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session.user.tenancyId}/class-schedule`)
      .then(res => res.json())
      .then(data => {
        // Converter dados para formato do FullCalendar com eventos recorrentes
        const formattedEvents = data.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          classId: event.classId, // Manter ID da turma para redirecionamento
          // Usar cor baseada na modalidade se disponível
          backgroundColor: modalityColors[event.modality] || modalityColors.default,
          borderColor: modalityColors[event.modality] || modalityColors.default,
          textColor: "#ffffff",
          extendedProps: {
            classId: event.classId,
            modality: event.modality,
            teacherName: event.teacherName,
          }
        }));
        setEvents(formattedEvents);
      })
      .finally(() => setLoading(false));
  }, [session?.user?.tenancyId]);

  // Função para lidar com clique em evento (redirecionar para página da turma)
  const handleEventClick = (clickInfo: EventClickArg) => {
    const classId = clickInfo.event.extendedProps.classId;
    if (classId) {
      router.push(`/system/academic/classes/${classId}`);
    }
  };



  // Função para processar eventos em formato de tabela
  const generateTableData = () => {
    const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const timeSlots = new Set<string>();
    // Obter todos os horários únicos
    events.forEach((event: any) => {
      const startTime = dayjs(event.start).format('HH:mm');
      const endTime = dayjs(event.end).format('HH:mm');
      timeSlots.add(`${startTime} - ${endTime}`);
    });
    const sortedTimeSlots = Array.from(timeSlots).sort();
    // Criar matriz da tabela
    const tableData = sortedTimeSlots.map(timeSlot => {
      const row: any = { timeSlot };
      weekDays.forEach(day => {
        row[day] = [];
      });
      // Usar Set para evitar duplicidade de classId
      const seen = {} as Record<string, Set<string>>;
      weekDays.forEach(day => { seen[day] = new Set(); });
      events.forEach((event: any) => {
        const eventStart = dayjs(event.start).format('HH:mm');
        const eventEnd = dayjs(event.end).format('HH:mm');
        const eventTimeSlot = `${eventStart} - ${eventEnd}`;
        const eventDay = weekDays[dayjs(event.start).day()];
        if (eventTimeSlot === timeSlot && row[eventDay] && !seen[eventDay].has(event.classId)) {
          row[eventDay].push({
            title: event.title,
            color: event.backgroundColor || modalityColors.default,
            modality: event.extendedProps?.modality || 'Não informado'
          });
          seen[eventDay].add(event.classId);
        }
      });
      return row;
    });
    return { weekDays, tableData };
  };

  // Função para imprimir tabela
  const handleTablePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const { weekDays, tableData } = generateTableData();
    let tableHTML = '<!DOCTYPE html><html><head><title>Grade de Aulas - Tabela</title>';
    tableHTML += `<style>
      @page { size: A4 landscape; margin: 1cm; }
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      .header { text-align: center; margin-bottom: 30px; }
      .header h1 { color: #7c3aed; margin: 0; }
      .header p { margin: 5px 0; color: #000; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { background-color: #FFF; border: 1px solid #bbb; padding: 8px; text-align: center; vertical-align: top; }
      th { background-color: #FFF; color: #000; font-weight: bold; }
      .time-slot { background-color: #FFF; font-weight: bold; white-space: nowrap; color: #000; }
      .class-item { margin: 2px 0; padding: 4px; border-radius: 4px; font-size: 12px; line-height: 1.3; background-color: #fff; color: #000; text-shadow: none; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
      .modality { font-size: 10px; opacity: 0.95; color: #000; background-color: #fff; }
      td { height: 60px; background: #fff; color: #000; }
      @media print { body { margin: 0; padding: 10px; } .no-print { display: none; } }
    </style></head><body>`;
    tableHTML += `<div class="header"><h1>Grade de Aulas</h1><p>Academia de Dança - ${dayjs().format('DD/MM/YYYY')}</p></div>`;
    tableHTML += '<table><thead><tr><th style="width: 120px;">Horário</th>';
    tableHTML += weekDays.map(day => `<th>${day}</th>`).join('');
    tableHTML += '</tr></thead><tbody>';
    tableData.forEach(row => {
      tableHTML += `<tr><td class="time-slot">${row.timeSlot}</td>`;
      weekDays.forEach(day => {
        tableHTML += '<td>';
        (row[day] || []).forEach((classItem: any) => {
          tableHTML += `<div class="class-item"><div>${classItem.title}</div><div class="modality">${classItem.modality}</div></div>`;
        });
        tableHTML += '</td>';
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    tableHTML += `<script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>`;
    tableHTML += '</body></html>';
    printWindow.document.write(tableHTML);
    printWindow.document.close();
  };

  return (
    <div className="p-4 md:p-8">
              <Group justify="space-between" mb="md">
          <Title order={2}>Grade de Aulas</Title>
          <Group>
            <Button
              leftSection={<FaTable size={16} />}
              onClick={handleTablePrint}
              variant="filled"
              color="violet"
            >
              Imprimir Tabela
            </Button>
          </Group>
        </Group>
      <Paper shadow="xs" radius="md" p="xl" className="bg-white print:shadow-none print:border print:border-gray-300">
        {loading ? (
          <Loader />
        ) : (
          <div className="fullcalendar-custom">
            <style jsx global>{`
              /* Customizar botões do FullCalendar */
              .fc-button-primary {
                background-color: #7c3aed !important;
                border-color: #7c3aed !important;
                color: white !important;
              }
              
              .fc-button-primary:hover {
                background-color: #6d28d9 !important;
                border-color: #6d28d9 !important;
              }
              
              .fc-button-primary:not(:disabled):active {
                background-color: #5b21b6 !important;
                border-color: #5b21b6 !important;
              }
              
              .fc-button-primary:disabled {
                background-color: #c4b5fd !important;
                border-color: #c4b5fd !important;
              }
              
              /* Evitar quebra de texto nos eventos */
              .fc-event-title {
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
              }
              
              .fc-event {
                font-weight: 600 !important;
                border-radius: 6px !important;
                cursor: pointer !important;
                transition: transform 0.1s ease, box-shadow 0.1s ease !important;
              }
              
              .fc-event:hover {
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
              }
              
              /* Estilizar header dos dias */
              .fc-col-header-cell {
                background-color: #f8fafc !important;
              }
              
              .fc-today {
                background-color: #f3f4f6 !important;
              }

              /* Estilos para impressão */
              @media print {
                body * {
                  visibility: hidden;
                }
                
                .fullcalendar-custom, .fullcalendar-custom * {
                  visibility: visible;
                }
                
                .fullcalendar-custom {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100% !important;
                }
                
                /* Ocultar botões de navegação na impressão */
                .fc-toolbar {
                  display: none !important;
                }
                
                /* Otimizar cores para impressão */
                .fc-event {
                  border: 2px solid #000 !important;
                  background-color: transparent !important;
                  color: #000 !important;
                  font-weight: bold !important;
                  transform: none !important;
                  box-shadow: none !important;
                }
                
                /* Header da página para impressão */
                .fullcalendar-custom::before {
                  content: "Grade de Aulas - ${new Date().toLocaleDateString('pt-BR')}";
                  display: block;
                  text-align: center;
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 20px;
                  padding: 10px 0;
                  border-bottom: 2px solid #000;
                }
                
                /* Melhorar contraste dos headers dos dias */
                .fc-col-header-cell {
                  background-color: #e5e7eb !important;
                  border: 1px solid #000 !important;
                  font-weight: bold !important;
                }
                
                /* Grid mais visível */
                .fc-timegrid-slot {
                  border-color: #d1d5db !important;
                }
                
                /* Remover cores de fundo desnecessárias */
                .fc-today {
                  background-color: transparent !important;
                }
                
                /* Tamanho da página */
                @page {
                  size: A4 landscape;
                  margin: 1cm;
                }
              }
            `}</style>
            <FullCalendar
              plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
              initialView="timeGridDay"
              headerToolbar={{
                left: "title",
                center: "",
                right: "timeGridWeek,timeGridDay",
              }}
              locale="pt-br"
              events={events}
              eventClick={handleEventClick}
              height={600}
              slotMinTime="07:00:00"
              slotMaxTime="23:00:00"
              allDaySlot={false}
              weekends={true}
              dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
              buttonText={{
                today: "Hoje",
                week: "Semana",
                day: "Dia",
              }}
              noEventsText="Nenhuma aula"
              eventDisplay="block"
              displayEventTime={true}
            />
          </div>
        )}
      </Paper>
    </div>
  );
}
