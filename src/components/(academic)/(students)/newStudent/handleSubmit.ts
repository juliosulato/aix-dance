import studentSchema from "@/schemas/studentSchema";
import { GuardianFormData } from "@/types/studentForm";
import dayjs from "dayjs";

async function handleSubmit(formData: FormData, tenancyId: string, guardians: GuardianFormData[] | null, image?: File) {
    const body = {
        "firstName": formData.get("firstName"),
        "lastName": formData.get("lastName"),
        "gender": formData.get("gender"),
        "cellPhoneNumber": formData.get("cellPhoneNumber")?.toString(),
        "dateOfBirth": formData.get("dateOfBirth") ? dayjs(formData.get("dateOfBirth")?.toString()).toDate() : null,
        "phoneNumber": formData.get("phoneNumber")?.toString(),
        "documentOfIdentity": formData.get("documentOfIdentity"),
        "email": formData.get("email"),
        "howDidYouMeetUs": formData.get("howDidYouMeetUs"),
        "instagramUser": formData.get("instagramUser"),
        "healthProblems": formData.get("healthProblems") ?? "",
        "medicalAdvice": formData.get("medicalAdvice") ?? "",
        "painOrDiscomfort": formData.get("painOrDiscomfort") ?? "",
        "canLeaveAlone": formData.get("canLeaveAlone") == "on",
        "address": {
            "publicPlace": formData.get("publicPlace"),
            "number": formData.get("number"),
            "complement": formData.get("complement"),
            "neighborhood": formData.get("neighborhood"),
            "city": formData.get("city"),
            "state": formData.get("state"),
            "zipCode": formData.get("zipCode")
        },
        "guardian": guardians ?? []
    }

    body.cellPhoneNumber = body.cellPhoneNumber?.replace(/\D/g, "");
    body.phoneNumber = body.phoneNumber?.toString().replace(/\D/g, "") || undefined;

    console.log(body);

    const validatedData = studentSchema.parse(body);

    if (validatedData) {
        await fetch(`http://localhost:8001/api/v1/tenancies/${tenancyId}/students`, {
            method: "POST",
            body: JSON.stringify(validatedData),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((resp) => resp.json())
    }

}

export default handleSubmit;