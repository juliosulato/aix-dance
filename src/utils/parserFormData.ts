export const parseFormData = (formData: FormData) => {
   return Object.fromEntries(formData.entries());
};