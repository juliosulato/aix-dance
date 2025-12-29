type ContractStatus= "PENDING" | "SENT" | "SIGNED" | "CANCELED";

type StudentContract = {
    id: string;
    htmlContent: string;
    status: ContractStatus;
    sentAt: Date | null;
    signedAt: Date | null;
    studentId: string;
    subscriptionId: string | null;
    archive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

type ContractSignatureLog = {
    ipAddress: string;
    location: string | null;
    fullName: string;
    document: string;
    id: string;
    signedAt: Date;
    studentContractId: string;
    userAgent: string;
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type ContractModel = {
    tenancyId: string;
    id: string;
    title: string;
    htmlContent: string;
    variablePresets: JsonValue;
    createdAt: Date;
    updatedAt: Date;
}
    

export type { StudentContract, ContractStatus, ContractSignatureLog, ContractModel };