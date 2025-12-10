// Centralized S3 client configuration and utilities
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Validate required environment variables
const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET_NAME'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Single S3 client instance (singleton pattern)
export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Constants
export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
export const AWS_REGION = process.env.AWS_REGION!;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const DEFAULT_UPLOAD_EXPIRATION = 600; // 10 minutes
export const DEFAULT_DOWNLOAD_EXPIRATION = 900; // 15 minutes

// Allowed content types (can be overridden by env var)
const DEFAULT_ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

/**
 * Get allowed content types from environment or use defaults
 */
export function getAllowedContentTypes(): string[] {
  const whitelist = process.env.UPLOAD_CONTENT_TYPE_WHITELIST;
  if (whitelist) {
    return whitelist.split(',').map(s => s.trim()).filter(Boolean);
  }
  return DEFAULT_ALLOWED_CONTENT_TYPES;
}

/**
 * Validate content type against allowed list
 */
export function isContentTypeAllowed(contentType: string): boolean {
  const allowed = getAllowedContentTypes();
  return allowed.includes(contentType);
}

/**
 * Sanitize filename to prevent path traversal and other issues
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and special characters
  return filename
    .replace(/[\/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255); // Limit filename length
}

/**
 * Sanitize prefix to ensure valid S3 key prefix
 */
export function sanitizePrefix(prefix?: string): string {
  if (!prefix) return '';
  const sanitized = String(prefix).replace(/[^a-zA-Z0-9_\-\/]/g, '');
  // Ensure it ends with / if not empty
  return sanitized ? `${sanitized}/` : '';
}

/**
 * Generate presigned URL for uploading a file to S3
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = DEFAULT_UPLOAD_EXPIRATION
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate presigned URL for downloading a file from S3
 */
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = DEFAULT_DOWNLOAD_EXPIRATION
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Extract S3 key from full URL
 * Supports both path-style and virtual-hosted-style URLs
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Path-style: https://s3.region.amazonaws.com/bucket/key
    // Virtual-hosted-style: https://bucket.s3.region.amazonaws.com/key
    if (urlObj.hostname.includes(BUCKET_NAME)) {
      // Virtual-hosted-style
      return pathname.startsWith('/') ? pathname.slice(1) : pathname;
    } else {
      // Path-style: remove leading /bucket-name/
      const parts = pathname.split('/').filter(Boolean);
      if (parts[0] === BUCKET_NAME) {
        return parts.slice(1).join('/');
      }
      return parts.join('/');
    }
  } catch (error) {
    console.error('Failed to extract key from URL:', url, error);
    return null;
  }
}

/**
 * Build public S3 URL for a given key
 */
export function buildS3Url(key: string): string {
  return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}
