import { Teacher } from "@/types/teacher.types";
import { Account, User, Session } from "@/types/user.types";

export interface UserFromApi extends User {
    accounts: Account[];
    sessions: Session[];
    teacher: Teacher | null;
}