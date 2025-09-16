import { Account, Session, Teacher, User } from "@prisma/client";

export interface UserFromApi extends User {
    accounts: Account[];
    sessions: Session[];
    teacher: Teacher | null;
}