/**
 * Environment variables configuration and validation
 * This file centralizes all environment variable access and provides type safety
 */

// Type-safe environment variable access
export const env = {
  // Public variables (exposed to client)
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || '',
  
  // Server-only variables
  DATABASE_URL: process.env.DATABASE_URL || '',
  AUTH_SECRET: process.env.AUTH_SECRET || '',
  
  // AWS S3 Configuration
  AWS_REGION: process.env.AWS_REGION || '',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || '',
  
  // Optional AWS configuration
  UPLOAD_CONTENT_TYPE_WHITELIST: process.env.UPLOAD_CONTENT_TYPE_WHITELIST || '',
  
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

/**
 * Validate required environment variables
 * Call this at application startup (server-side only)
 */
export function validateServerEnv(): void {
  const required = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET_NAME',
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

/**
 * Validate public environment variables
 * Call this at application startup (can be used client-side)
 */
export function validatePublicEnv(): void {
  const required = ['NEXT_PUBLIC_BACKEND_URL'];
  
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(
      `Missing required public environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}`
    );
  }
}

/**
 * Check if we're running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if we're running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if we're running in test
 */
export const isTest = env.NODE_ENV === 'test';
