type Class = {
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

export { Class };