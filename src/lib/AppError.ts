export class AppError extends Error {
  public digest: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'AppError';
    this.digest = code; 
  }
}