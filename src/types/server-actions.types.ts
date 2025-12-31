export type ActionState<T> = {
  errors?: {
    [K in keyof T]?: string[]; 
  };
  error?: string | undefined;
  success?: boolean | undefined;
};