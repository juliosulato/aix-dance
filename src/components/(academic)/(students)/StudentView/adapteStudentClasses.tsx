import { ClassFromApi } from "./StudentClasses";

export interface StudentClassFromApi {
  id: string;
  status: "ACTIVE" | "INACTIVE";
  enrolledAt: string;
  leftAt: string | null;
  class: ClassFromApi;
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
      studentClasses: sc.class.studentClasses.map((ssc: any) => ssc.student),
      createdAt: sc.class.createdAt,
      updatedAt: sc.class.updatedAt,
      active: sc.class.active,
      tenancyId: sc.class.tenancyId,
    },
  }));
}
