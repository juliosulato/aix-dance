export const fetcher = async <T = any>(url: string): Promise<T> => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Erro ao buscar: ${res.statusText}`);
  }

  return res.json();
};
