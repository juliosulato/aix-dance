import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { authClient } from "@/lib/auth-client";
import { requireAuth } from "@/lib/auth-guards";

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

const sanitizeFilename = (name: string) => {
    const trimmed = name.trim();
    const safe = trimmed.replace(/[^a-zA-Z0-9._-]/g, "");
    return safe.length > 0 ? safe : "upload";
};

const normalizePrefix = (raw?: string) => {
    if (!raw) return "uploads";
    const segments = raw
        .split("/")
        .map((segment) => segment.trim())
        .filter(Boolean)
        .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, ""))
        .filter(Boolean);

    if (segments.some((segment) => segment === "." || segment === "..")) {
        throw new Error("Invalid prefix segment");
    }

    return segments.length > 0 ? segments.join("/") : "uploads";
};

export async function POST(request: Request) {
    try {
        const { user } = await requireAuth();

        const { filename, contentType, size, prefix } = await request.json();

        if (!filename || !contentType) {
            return NextResponse.json({ error: "Filename and contentType are required" }, { status: 400 });
        }

        const maxBytes = Number(process.env.UPLOAD_MAX_BYTES ?? DEFAULT_MAX_BYTES);
        if (typeof size === "number" && size > maxBytes) {
            return NextResponse.json({ error: `File too large. Max allowed is ${maxBytes} bytes.` }, { status: 400 });
        }

        const safeFilename = sanitizeFilename(filename);
        let normalizedPrefix = "uploads";

        try {
            normalizedPrefix = normalizePrefix(typeof prefix === "string" ? prefix : undefined);
        } catch {
            return NextResponse.json({ error: "Invalid upload prefix" }, { status: 400 });
        }

        const keySegments = [`tenancies/${user?.tenancyId}`, normalizedPrefix, `${randomUUID()}-${safeFilename}`];
        const objectKey = keySegments.join("/");

        const whitelist = process.env.UPLOAD_CONTENT_TYPE_WHITELIST;
        if (whitelist) {
            const allowed = whitelist.split(",").map((s) => s.trim()).filter(Boolean);
            if (!allowed.includes(contentType)) {
                return NextResponse.json({ error: "Content type not allowed" }, { status: 400 });
            }
        }

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: objectKey,
            ContentType: contentType,
        });

        // TODO: move to IAM role scoped per tenancy once creds are available.
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectKey}`;

        return NextResponse.json({ uploadUrl, fileUrl });
    } catch (error) {
        console.error("Error creating presigned URL:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}