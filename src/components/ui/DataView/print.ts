import { Column } from "@/types/data-view.types";
import dayjs from "dayjs";

export const printData = <T>(title: string, data: T[], columns: Column<T>[]) => {
    const tableHeaders = columns.map((col) => `<th style="text-align: ${col.align || 'left'}">${col.label}</th>`).join("");

    const tableRows = data.map((item) => {
        const cells = columns.map((col) => {
            const val = (item as any)[col.key];
            const content = col.render ? "Ver no sistema" : (val ?? "-");
            return `<td style="text-align: ${col.align || 'left'}">${content}</td>`;
        }).join("");
        return `<tr>${cells}</tr>`;
    }).join("");

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f4f4f4; }
            @media print { @page { size: landscape; } }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Gerado em: ${dayjs().format("DD/MM/YYYY HH:mm")}</p>
          <table><thead><tr>${tableHeaders}</tr></thead><tbody>${tableRows}</tbody></table>
        </body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, { position: "absolute", width: "0", height: "0", border: "0" });
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
    }
    setTimeout(() => iframe.remove(), 1000);
};