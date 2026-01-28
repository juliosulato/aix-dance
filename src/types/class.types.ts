import { Student, StudentClass } from "./student.types";
import { Teacher } from "./teacher.types";
import { User } from "./user.types";

export type Class = {
    name: string;
    id: string;
    tenantId: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    teacherId: string;
    modalityId: string;
    modality: Modality;
    online: boolean;
    assistantId: string | null;
    classAttendances?: ClassAttendance[];
    studentClasses: (StudentClass & {
        student: Student;
    })[];
}

export interface ClassWithTeacher extends Class {
    teacher: User & {
        teacher: Teacher
    };
    assistant?: User & {
        teacher: Teacher
    };
}

export type ClassAttendance = {
    id: string;
    teacherId: string;
    classId: string;
    date: Date;
    isSubstitute: boolean;
}

export type Modality = {
    name: string;
    id: string;
    tenantId: string;       
    createdAt?: Date;
    updatedAt?: Date;
}

export enum DayOfWeek {
    SUNDAY = "SUNDAY",
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY"
}
