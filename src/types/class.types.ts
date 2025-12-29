export type Class = {
    name: string;
    id: string;
    tenancyId: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    teacherId: string;
    modalityId: string;
    online: boolean;
    assistantId: string | null;
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
    tenancyId: string;
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
