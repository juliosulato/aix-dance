// src/messages/loadMessages.js
// Este código usa APIs assíncronas do Node.js, portanto, é mais adequado para o ambiente do servidor.

import fs from 'fs/promises';
import path from 'path';

export async function loadMessages(locale) {
    const messages = {};
    const dir = path.join(process.cwd(), `src/messages/${locale}`);

    try {
        const files = await fs.readdir(dir);

        for (const file of files) {
            if (file.endsWith('.json')) {
                const namespace = file.replace('.json', '');
                const filePath = path.join(dir, file);
                const fileContent = await fs.readFile(filePath, 'utf-8');
                
                try {
                    messages[namespace] = JSON.parse(fileContent);
                } catch (e) {
                    console.error(`Erro ao analisar o arquivo JSON: ${filePath}`, e);
                }
            }
        }
    } catch (error) {
        console.error(`Não foi possível carregar os arquivos de tradução para a localidade "${locale}".`, error);
    }

    return messages;
}