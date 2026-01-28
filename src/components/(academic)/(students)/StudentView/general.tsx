"use client";

import InfoTerm from "@/components/ui/Infoterm";
import dayjs from "dayjs";
import { Avatar } from "@mantine/core";
import { Gender, StudentComplete } from "@/types/student.types";

export default function GeneralStudentsView({
  student,
}: {
  student: StudentComplete;
}) {
  let gender: Gender | string = student.gender;

  switch (student.gender) {
    case "MALE":
      gender = "Homem";
      break;
    case "FEMALE":
      gender = "Mulher";
      break;
    case "NON_BINARY":
      gender = "Não-binário";
      break;
    case "OTHER":
      gender = "Outro";
      break;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 my-4 md:my-6">
      <Avatar
        src={student.image}
        name={student.firstName}
        size={"xl"}
        radius="16px"
        className="h-fit! w-full! aspect-square md:w-32! md:h-32! md:w-inherit!"
      />


      <div className="grid gap-4 md:gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 md:p-6 lg:p-8 border border-gray-300 rounded-2xl">
        <h2 className="font-semibold text-lg md:text-xl md:col-span-2 lg:col-span-3 xl:col-span-4  mb-4">
          {"Informações Pessoais"}
        </h2>
        <InfoTerm label={"Primeiro Nome"}>
          {`${student.firstName} ${student.lastName}`}
        </InfoTerm>
        <InfoTerm label={""}>
          <a
            href={`https://wa.me/${student.phoneNumber}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            {student.phoneNumber}
          </a>
        </InfoTerm>
        <InfoTerm label={"Telefone"}>{student.phoneNumber}</InfoTerm>
        <InfoTerm label={"Email"}>{student.email}</InfoTerm>
        <InfoTerm label={"Data de Nascimento"}>
          {dayjs(student.dateOfBirth).format("DD/MM/YYYY")}
        </InfoTerm>
        <InfoTerm label={"Documento de Identidade"}>
          {student.nationalId}
        </InfoTerm>
        <InfoTerm label={"Gênero"}>{gender}</InfoTerm>
        {student.pronoun && <InfoTerm label={"Pronome"}>{student.pronoun}</InfoTerm>}
        <InfoTerm label={"Como nos conheceu?"}>
          {student.howDidYouMeetUs}
        </InfoTerm>
        <InfoTerm label={"Instagram"}>{student.instagramUser}</InfoTerm>
      </div>

      <div className="grid gap-4 md:gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 md:p-6 lg:p-8 border border-gray-300 rounded-2xl">
        <h2 className="font-semibold text-lg md:text-xl md:col-span-2 lg:col-span-3 xl:col-span-4  mb-4">
          {"Endereço"}
        </h2>
        <InfoTerm label={"Logradouro"}>
          {`${student?.address?.publicPlace}`}
        </InfoTerm>
        <InfoTerm label={"Bairro"}>{student?.address?.neighborhood}</InfoTerm>
        <InfoTerm label={"Complemento"}>{student?.address?.complement}</InfoTerm>
        <InfoTerm label={"Número"}>{student?.address?.number}</InfoTerm>
        <InfoTerm label={"Cidade"}>{student?.address?.city}</InfoTerm>
        <InfoTerm label={"Estado"}>{student?.address?.state}</InfoTerm>
        <InfoTerm label={"CEP"}>{student?.address?.zipCode}</InfoTerm>
      </div>
      <div className="flex flex-col gap-4  p-4 md:p-6 lg:p-8 border border-gray-300 rounded-2xl">
        <h2 className="font-semibold text-lg md:text-xl md:col-span-2 lg:col-span-3 xl:col-span-4  mb-4">
          {"Saúde e Bem-Estar"}
        </h2>
        <InfoTerm label={"Problemas de Saúde"}>{`${student.healthProblems}`}</InfoTerm>
        <InfoTerm label={"Orientação Médica"}>{`${student.medicalAdvice}`}</InfoTerm>
        <InfoTerm label={"Dor ou Desconforto"}>{`${student.painOrDiscomfort}`}</InfoTerm>
        <InfoTerm label={"Pode Sair Sozinho?"}>
          {`${student.canLeaveAlone ? "Sim" : "Não"}`}
        </InfoTerm>
      </div>

      {student.guardian?.length > 0 &&
        student.guardian.map((guardian) => (
          <div
            key={guardian.id || guardian.phoneNumber || `${guardian.firstName}-${guardian.lastName}`}
            className="grid gap-4 md:gap-y-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 md:p-6 lg:p-8 border border-gray-300 rounded-2xl"
          >
            <h2 className="font-semibold text-lg md:text-xl md:col-span-2 lg:col-span-3 xl:col-span-4  mb-4">
              {"Dados do Responsável"}
            </h2>
            <InfoTerm label={"Nome"}>
              {`${guardian.firstName} ${guardian.lastName}`}
            </InfoTerm>
            <InfoTerm label={"Parentesco"}>{`${guardian.relationShip}`}</InfoTerm>
            <InfoTerm label={"Celular"}>
              <a
                href={`https://wa.me/${guardian.phoneNumber}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                {guardian.phoneNumber}
              </a>
            </InfoTerm>
            <InfoTerm label={"Email"}>{`${student.email}`}</InfoTerm>
          </div>
        ))}
    </div>
  );
}
