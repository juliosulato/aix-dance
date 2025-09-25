// src/app/api/upload/route.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(request: Request) {
    try {
            const { filename, contentType, size } = await request.json();

            if (!filename || !contentType) {
                return NextResponse.json({ error: "Filename and contentType are required" }, { status: 400 });
            }

            // Optional size validation: reject requests that declare a file larger than 5MB
            const MAX_BYTES = 5 * 1024 * 1024; // 5MB
            if (typeof size === 'number' && size > MAX_BYTES) {
                return NextResponse.json({ error: `File too large. Max allowed is ${MAX_BYTES} bytes.` }, { status: 400 });
            }

    // Gera um nome de arquivo único para evitar conflitos
        const { prefix } = await request.json().catch(() => ({}));

        const safePrefix = prefix ? `${String(prefix).replace(/[^a-zA-Z0-9_\-\/]/g, "")}/` : "";
        const uniqueKey = `${safePrefix}${randomUUID()}-${filename}`;

        // Optional content-type whitelist from env (comma separated)
        const whitelist = process.env.UPLOAD_CONTENT_TYPE_WHITELIST;
        if (whitelist) {
            const allowed = whitelist.split(",").map(s => s.trim()).filter(Boolean);
            if (!allowed.includes(contentType)) {
                return NextResponse.json({ error: "Content type not allowed" }, { status: 400 });
            }
        }

        // Provide ContentDisposition so browser downloads keep original filename
        const contentDisposition = `attachment; filename="${encodeURIComponent(filename)}"`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: uniqueKey,
            ContentType: contentType,
            ContentDisposition: contentDisposition,
        });

        // Gera a URL pré-assinada para o upload (expira em 10 minutos)
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });
        
        // Gera a URL final do arquivo que será salva no banco
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

        return NextResponse.json({ uploadUrl, fileUrl });

    } catch (error) {
        console.error("Error creating presigned URL:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}