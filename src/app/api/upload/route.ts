// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  isContentTypeAllowed,
  sanitizeFilename,
  sanitizePrefix,
  generatePresignedUploadUrl,
  buildS3Url,
  MAX_FILE_SIZE,
} from "@/lib/s3";

export async function POST(request: Request) {
  try {
    const { filename, contentType, size, prefix } = await request.json();

    // Validate required fields
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and contentType are required" },
        { status: 400 }
      );
    }

    // Validate file size
    if (typeof size === 'number' && size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max allowed is ${MAX_FILE_SIZE} bytes.` },
        { status: 400 }
      );
    }

    // Validate content type
    if (!isContentTypeAllowed(contentType)) {
      return NextResponse.json(
        { error: "Content type not allowed" },
        { status: 403 }
      );
    }

    // Sanitize and generate unique key
    const safePrefix = sanitizePrefix(prefix);
    const safeFilename = sanitizeFilename(filename);
    const uniqueKey = `${safePrefix}${randomUUID()}-${safeFilename}`;

    // Generate presigned URL for upload
    const uploadUrl = await generatePresignedUploadUrl(uniqueKey, contentType);

    // Generate final file URL
    const fileUrl = buildS3Url(uniqueKey);

    return NextResponse.json({ uploadUrl, fileUrl, key: uniqueKey });
  } catch (error) {
    console.error("Error creating presigned URL:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}