// Em um arquivo como: src/app/api/v1/tenancies/[tenancyId]/students/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Seu cliente prisma
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Reutilize o mesmo cliente S3 que você usa para o upload
const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function GET(request: Request, { params }: { params: { tenancyId: string } }) {
    // 1. Busque os dados do banco de dados como você já faz
    const studentsFromDb = await prisma.student.findMany({
        where: {
            tenancyId: params.tenancyId,
        },
    });

    // 2. Gere as URLs assinadas para cada aluno que tiver uma imagem
    const studentsWithSignedUrls = await Promise.all(
        studentsFromDb.map(async (student) => {
            // Se o aluno não tiver imagem, apenas retorne os dados dele
            if (!student.image) {
                return student;
            }

            // Extrai a 'chave' (key) do objeto a partir da URL completa salva no banco
            // Ex: "https://.../meu-arquivo.jpg" -> "meu-arquivo.jpg"
            const key = student.image.split('/').pop();

            if (!key) {
                return student; // Retorna o aluno sem imagem se a URL for malformada
            }

            const command = new GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: key,
            });

            // Gera uma URL que expira em 15 minutos (900 segundos)
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

            // Retorna o objeto do aluno, substituindo a URL antiga pela nova URL assinada
            return {
                ...student,
                image: signedUrl,
            };
        })
    );
    
    // 3. Retorne os dados com as URLs temporárias para o front-end
    return NextResponse.json(studentsWithSignedUrls);
}