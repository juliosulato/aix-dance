import { serverFetch } from "@/lib/server-fetch";
import { EnrollStudentsInput } from "@/schemas/academic/class.schema";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export class StudentClassesService {

    static enrollStudents(tenantId: string, classId: string, data: EnrollStudentsInput) {
        return serverFetch(`${BASE_URL}/api/v1/tenancies/${tenantId}/academic/classes/${classId}/enroll`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    static archiveStudentClass(tenantId: string, studentClassId: string) {
        return serverFetch(`${BASE_URL}/api/v1/tenancies/${tenantId}/academic/student-classes/${studentClassId}/archive`, {
            method: "PATCH",
        });
    }
}
