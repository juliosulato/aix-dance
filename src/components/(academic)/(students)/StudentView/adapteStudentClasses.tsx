import { ClassFromApi } from "./StudentClasses";

export interface StudentClassFromApi {
  id: string;
  status: "ACTIVE" | "INACTIVE";
  enrolledAt: string;
  leftAt: string | null;
  class: ClassFromApi;
  // total number of lessons for this class (based on class attendance sheets)
  attendanceTotal?: number;
  // number of presences of this student in that class
  attendancePresent?: number;
  // percentage (0-100) rounded integer
  attendancePercentage?: number;
}

export function adaptStudentClasses(apiStudent: any): StudentClassFromApi[] {
  return (apiStudent.classes || []).map((sc: any) => ({
    id: sc.id,
    status: sc.status,
    enrolledAt: sc.enrolledAt,
    leftAt: sc.leftAt,
    class: {
      id: sc.class.id,
      name: sc.class.name,
      modality: sc.class.modality,
      teacher: sc.class.teacher,
      assistant: sc.class.assistant,
      // include student list
      studentClasses: sc.class.studentClasses.map((ssc: any) => ssc.student),
      // include attendance sheets if present on the API payload
      classAttendances: sc.class.classAttendances || [],
      createdAt: sc.class.createdAt,
      updatedAt: sc.class.updatedAt,
      active: sc.class.active,
      tenancyId: sc.class.tenancyId,
    },
    // --- compute attendance for this student in this class ---
    // If the backend already attached an attendanceSummary on the class (from student.findById), use it
    attendanceTotal: sc.attendanceSummary?.attendanceTotal ?? (() => {
      const lessons = sc.class.classAttendances || [];
      return lessons.length;
    })(),
    attendancePresent: sc.attendanceSummary?.attendancePresent ?? (() => {
      const records = apiStudent.attendanceRecords || [];
      const lessons = sc.class.classAttendances || [];
      if (!lessons.length) return 0;
      const lessonIds = new Set(lessons.map((l: any) => l.id));
      return records.filter((r: any) => r.present && lessonIds.has(r.classAttendanceId)).length;
    })(),
    attendancePercentage: sc.attendanceSummary?.attendancePercentage ?? (() => {
      const lessons = sc.class.classAttendances || [];
      const total = lessons.length;
      if (total === 0) return 0;
      const records = apiStudent.attendanceRecords || [];
      const lessonIds = new Set(lessons.map((l: any) => l.id));
      const present = records.filter((r: any) => r.present && lessonIds.has(r.classAttendanceId)).length;
      return Math.round((present / total) * 100);
    })(),
  }));
}
