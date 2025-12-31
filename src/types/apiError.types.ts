export type ApiError = {
  message: string;
  errors: {
    expected: string;
    code: string;
    path: unknown[];
    message: string;
  }[];
};
