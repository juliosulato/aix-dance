export function objectToFormData(data: Record<string, any>): FormData {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value === undefined || value === null) return;

    if (value instanceof File) {
      formData.append(key, value);
    } 
    else if (typeof value === 'object' && !(value instanceof Date)) {
      formData.append(key, JSON.stringify(value));
    } 
    else {
      formData.append(key, String(value));
    }
  });

  return formData;
}