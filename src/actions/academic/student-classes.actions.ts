"use server";

import { protectedAction } from "@/lib/auth-guards";
import { ArchiveStudentClassInput, archiveStudentClassSchema, EnrollStudentsInput, enrollStudentsSchema } from "@/schemas/academic/class.schema";
import { StudentClassesService } from "@/services/academic/student-classes.service";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { handleValidationErrors } from "@/utils/handleValidationErrors";
import { updateTag } from "next/cache";

const enrollStudents = protectedAction(
  async (
    user,
    classId: string,
    data: EnrollStudentsInput
  ): Promise<ActionState<EnrollStudentsInput>> => {
    const validatedData = enrollStudentsSchema.safeParse(data);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    try {
      await StudentClassesService.enrollStudents(
        user.tenantId,
        classId,
        validatedData.data
      );

      updateTag("classes");
      return { success: true };
    } catch (error) {
      console.error(
        `Erro ao matricular estudantes na turma ${classId} na tenant ${user.tenantId}:`,
        error
      );
      return handleServerActionError(error);
    }
  }
);

const archiveStudentClass = protectedAction(
  async (
    user,
    data: ArchiveStudentClassInput
  ): Promise<ActionState<ArchiveStudentClassInput>> => {
    const validatedData = archiveStudentClassSchema.safeParse(data);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    try {
      await StudentClassesService.archiveStudentClass(
        user.tenantId,
        validatedData.data.studentClassId
      );

      updateTag("classes");
      return { success: true };
    } catch (error) {
      console.error(
        `Erro ao arquivar matrícula ${data.studentClassId} na tenant ${user.tenantId}:`,
        error
      );
      return handleServerActionError(error);
    }
  }
);

export { enrollStudents, archiveStudentClass };