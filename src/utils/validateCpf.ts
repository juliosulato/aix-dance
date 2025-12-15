export function isValidCpf(rawCpf: string): boolean {
  const cpf = rawCpf.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (factor: number) => {
    let total = 0;
    for (let i = 0; i < factor - 1; i += 1) {
      total += parseInt(cpf[i], 10) * (factor - i);
    }
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const digit1 = calcDigit(10);
  const digit2 = calcDigit(11);

  return digit1 === parseInt(cpf[9], 10) && digit2 === parseInt(cpf[10], 10);
}
