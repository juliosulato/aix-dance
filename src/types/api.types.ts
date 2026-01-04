export interface ApiErrorResponse {
  success: false;
  error: { 
    statusCode: string; 
    message: string; 
    details?: Record<string, unknown>; 
    field?: string;
    validationErrors?: Array<{
      field: string;
      message: string;
      value?: unknown;
    }>;
  };
}

export enum ErrorCodes {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  TENANT_ID_REQUIRED = "TENANT_ID_REQUIRED",
  
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
  CATEGORY_ALREADY_EXISTS = "CATEGORY_ALREADY_EXISTS",

  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  
  BUSINESS_ERROR = "BUSINESS_ERROR",
  
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}