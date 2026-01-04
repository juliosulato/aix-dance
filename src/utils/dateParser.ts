import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/pt-br";

dayjs.extend(customParseFormat);
dayjs.locale("pt-br");

export const dateParser = (input: string) => {
  if (!input) return null;

  const parsed = dayjs(input, ["DD/MM/YYYY", "DDMMYYYY", "D/M/YYYY"], true);

  if (parsed.isValid()) {
    return parsed.hour(12).minute(0).second(0).toDate();
  }

  return null;
};