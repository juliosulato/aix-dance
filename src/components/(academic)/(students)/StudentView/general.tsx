"use client";

import InfoTerm from "@/components/ui/Infoterm";
import { useTranslations } from "next-intl";
import { StudentFromApi } from "../modals/NewStudent";
import dayjs from "dayjs";
import { Gender } from "@prisma/client";

export default function GeneralStudentsView({ student }: { student: StudentFromApi }) {
    const t = useTranslations();

    let gender: Gender | string = student.gender;


    switch (student.gender) {
        case "MALE":
            gender = t("academic.students.modals.personalData.fields.gender.options.MALE")
            break;
        case "FEMALE":
            gender = t("academic.students.modals.personalData.fields.gender.options.FEMALE")
            break;
        case "NON_BINARY":
            gender = t("academic.students.modals.personalData.fields.gender.options.NON_BINARY")
            break;
        case "OTHER":
            gender = t("academic.students.modals.personalData.fields.gender.options.OTHER")
            break;
    }

    return (
        <div className="flex flex-col gap-4 md:gap-6 my-4 md:my-6">
            <div className="grid gap-4 md:gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 md:p-6 lg:p-8 border border-gray-300 rounded-2xl">
                <h2 className="font-semibold text-lg md:text-xl md:col-span-2 lg:col-span-3 xl:col-span-4  mb-4">{t("academic.students.modals.personalData.title")}</h2>
                <InfoTerm label={t("academic.students.modals.personalData.fields.fullName.label")} children={`${student.firstName} ${student.lastName}`} />
                <InfoTerm label={t("academic.students.modals.personalData.fields.cellPhoneNumber.label")} children={<a href={`https://wa.me/${student.cellPhoneNumber.replace(/\D/g, "")}`} target="_blank" className="text-primary hover:underline">{student.cellPhoneNumber}</a>} />
                <InfoTerm label={t("academic.students.modals.personalData.fields.phoneNumber.label")} children={student.phoneNumber} />
                <InfoTerm label={t("academic.students.modals.personalData.fields.email.label")} children={student.email} />
                <InfoTerm label={t("academic.students.modals.personalData.fields.dateOfBirth.label")} children={dayjs(student.dateOfBirth).format(t("forms.general-fields.dateOfBirth.format"))} />
                <InfoTerm label={t("academic.students.modals.personalData.fields.documentOfIdentity.label")} children={student.documentOfIdentity} />
                <InfoTerm label={t("academic.students.modals.personalData.fields.gender.label")} children={gender} />
                {student.pronoun && (
                    <InfoTerm label={t("academic.students.modals.personalData.fields.pronoun.label")} children={student.pronoun} />
                )}
                <InfoTerm label={t("academic.students.modals.personalData.fields.howDidYouMeetUs.label")} children={student.howDidYouMeetUs} />
                <InfoTerm label={t("academic.students.modals.personalData.fields.instagramUser.label")} children={student.instagramUser} />
            </div>

            <div className="grid gap-4 md:gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 md:p-6 lg:p-8 border border-gray-300 rounded-2xl">
                <h2 className="font-semibold text-lg md:text-xl md:col-span-2 lg:col-span-3 xl:col-span-4  mb-4">{t("academic.students.modals.address.title")}</h2>
                <InfoTerm label={t("academic.students.modals.address.fields.publicPlace.label")} children={`${student.address.publicPlace}`} />
                <InfoTerm label={t("academic.students.modals.address.fields.neighborhood.label")} children={student.address.neighborhood} />
                <InfoTerm label={t("academic.students.modals.address.fields.complement.label")} children={student.address.complement} />
                <InfoTerm label={t("academic.students.modals.address.fields.number.label")} children={student.address.number} />
                <InfoTerm label={t("academic.students.modals.address.fields.city.label")} children={student.address.city} />
                <InfoTerm label={t("academic.students.modals.address.fields.state.label")} children={student.address.state} />
                <InfoTerm label={t("academic.students.modals.address.fields.zipCode.label")} children={student.address.zipCode} />
            </div>
            <div className="flex flex-col gap-4  p-4 md:p-6 lg:p-8 border border-gray-300 rounded-2xl">
                <h2 className="font-semibold text-lg md:text-xl md:col-span-2 lg:col-span-3 xl:col-span-4  mb-4">{t("academic.students.modals.health.title")}</h2>
                <InfoTerm label={t("academic.students.modals.health.fields.healthProblems.label")} children={`${student.healthProblems}`} />
                <InfoTerm label={t("academic.students.modals.health.fields.medicalAdvice.label")} children={`${student.medicalAdvice}`} />
                <InfoTerm label={t("academic.students.modals.health.fields.painOrDiscomfort.label")} children={`${student.painOrDiscomfort}`} />
                <InfoTerm label={t("academic.students.modals.health.fields.canLeaveAlone.label")} children={`${student.canLeaveAlone ? t("general.boolean.yes") : t("general.boolean.no")}`} />
            </div>

            {student.guardian.length > 0 && (
                student.guardian.map((guardian) => (
                    <div className="grid gap-4 md:gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 md:p-6 lg:p-8 border border-gray-300 rounded-2xl">
                        <h2 className="font-semibold text-lg md:text-xl md:col-span-2 lg:col-span-3 xl:col-span-4  mb-4">{t("academic.students.modals.guardians.title")}</h2>
                        <InfoTerm label={t("academic.students.modals.personalData.fields.fullName.label")} children={`${guardian.firstName} ${guardian.lastName}`} />
                        <InfoTerm label={t("academic.students.modals.guardians.fields.relationship.label")} children={`${guardian.relationShip}`} />
                        <InfoTerm label={t("academic.students.modals.guardians.fields.cellPhoneNumber.label")} children={<a href={`https://wa.me/${guardian.cellPhoneNumber.replace(/\D/g, "")}`}>{guardian.cellPhoneNumber}</a>} />
                        <InfoTerm label={t("academic.students.modals.guardians.fields.email.label")} children={`${student.email}`} />
                    </div>
                ))
            )}
        </div>
    );
}