"use client";

import InfoTerm from "@/components/ui/Infoterm";
import dayjs from "dayjs";
import { Gender } from "@prisma/client";
import { Avatar } from "@mantine/core";
import { StudentFromApi } from "../StudentFromApi";

export default function GeneralStudentsView({ student }: { student: StudentFromApi }) {

    let gender: Gender | string = student.gender;


    switch (student.gender) {
        case "MALE":
            gender = "Texto"
            break;
        case "FEMALE":
            gender = "Texto"
            break;
        case "NON_BINARY":
            gender = "Texto"
            break;
        case "OTHER":
            gender = "Texto"
            break;
    }

    return (
        <div className="flex flex-col gap-4 md:gap-6 my-4 md:my-6">
            <Avatar src={student.image} name={student.firstName} size={"xl"} radius="16px" className="!h-fit !w-full aspect-square md:!w-32 md:!h-32 md:!w-inherit"/>

            <div className="grid gap-4 md:gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 md:p-6 lg:p-8 border border-gray-300 rounded-2xl">
                <h2 className="font-semibold text-lg md:text-xl md:col-span-2 lg:col-span-3 xl:col-span-4  mb-4">{"Texto"}</h2>
                <InfoTerm label={"Texto"} children={`${student.firstName} ${student.lastName}`} />
                <InfoTerm label={"Texto"} children={<a href={`https://wa.me/${student.cellPhoneNumber.replace(/\D/g, "")}`} target="_blank" className="text-primary hover:underline">{student.cellPhoneNumber}</a>} />
                <InfoTerm label={"Texto"} children={student.phoneNumber} />
                <InfoTerm label={"Texto"} children={student.email} />
                <InfoTerm label={"Texto"} children={dayjs(student.dateOfBirth).format("Texto")} />
                <InfoTerm label={"Texto"} children={student.documentOfIdentity} />
                <InfoTerm label={"Texto"} children={gender} />
                {student.pronoun && (
                    <InfoTerm label={"Texto"} children={student.pronoun} />
                )}
                <InfoTerm label={"Texto"} children={student.howDidYouMeetUs} />
                <InfoTerm label={"Texto"} children={student.instagramUser} />
            </div>

            <div className="grid gap-4 md:gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 md:p-6 lg:p-8 border border-gray-300 rounded-2xl">
                <h2 className="font-semibold text-lg md:text-xl md:col-span-2 lg:col-span-3 xl:col-span-4  mb-4">{"Texto"}</h2>
                <InfoTerm label={"Texto"} children={`${student.address.publicPlace}`} />
                <InfoTerm label={"Texto"} children={student.address.neighborhood} />
                <InfoTerm label={"Texto"} children={student.address.complement} />
                <InfoTerm label={"Texto"} children={student.address.number} />
                <InfoTerm label={"Texto"} children={student.address.city} />
                <InfoTerm label={"Texto"} children={student.address.state} />
                <InfoTerm label={"Texto"} children={student.address.zipCode} />
            </div>
            <div className="flex flex-col gap-4  p-4 md:p-6 lg:p-8 border border-gray-300 rounded-2xl">
                <h2 className="font-semibold text-lg md:text-xl md:col-span-2 lg:col-span-3 xl:col-span-4  mb-4">{"Texto"}</h2>
                <InfoTerm label={"Texto"} children={`${student.healthProblems}`} />
                <InfoTerm label={"Texto"} children={`${student.medicalAdvice}`} />
                <InfoTerm label={"Texto"} children={`${student.painOrDiscomfort}`} />
                <InfoTerm label={"Texto"} children={`${student.canLeaveAlone ? "Texto" : "Texto"}`} />
            </div>

            {student.guardian.length > 0 && (
                student.guardian.map((guardian) => (
                    <div className="grid gap-4 md:gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 md:p-6 lg:p-8 border border-gray-300 rounded-2xl">
                        <h2 className="font-semibold text-lg md:text-xl md:col-span-2 lg:col-span-3 xl:col-span-4  mb-4">{"Texto"}</h2>
                        <InfoTerm label={"Texto"} children={`${guardian.firstName} ${guardian.lastName}`} />
                        <InfoTerm label={"Texto"} children={`${guardian.relationShip}`} />
                        <InfoTerm label={"Texto"} children={<a href={`https://wa.me/${guardian.cellPhoneNumber.replace(/\D/g, "")}`}>{guardian.cellPhoneNumber}</a>} />
                        <InfoTerm label={"Texto"} children={`${student.email}`} />
                    </div>
                ))
            )}
        </div>
    );
}