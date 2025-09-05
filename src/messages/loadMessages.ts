// src/messages/loadMessages.js
// Este código lê recursivamente os arquivos .json e constrói um objeto de mensagens
// aninhado que espelha a estrutura de diretórios, permitindo o acesso via "caminhos.de.pontos".

import fs from 'fs/promises';
import path from 'path';

/**
 * Cria ou atualiza um objeto aninhado a partir de um array de chaves.
 * @param {Record<string, any>} base O objeto base para modificar.
 * @param {string[]} parts As partes do caminho que se tornarão as chaves aninhadas.
 * @param {any} value O valor a ser inserido no final do caminho.
 */
function createNestedObject(base: Record<string, any>, parts: string[], value: any): void {
    let current = base;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        // Se for a última parte, mescla o conteúdo do arquivo JSON
        if (i === parts.length - 1) {
            // Isso evita que um arquivo sobrescreva o conteúdo de outro no mesmo nível de pasta
            current[part] = { ...(current[part] || {}), ...value };
        } else {
            // Se não for a última parte, garante que o caminho exista como um objeto
            if (current[part] === undefined || typeof current[part] !== 'object') {
                current[part] = {};
            }
            current = current[part];
        }
    }
}


/**
 * Lê recursivamente todos os arquivos .json em um diretório e seus subdiretórios.
 * @param {string} dir O diretório a ser lido.
 * @param {string} rootDir O diretório raiz para calcular o namespace relativo.
 * @param {Record<string, any>} messages O objeto para preencher com as mensagens.
 */
async function readMessagesRecursively(dir: string, rootDir: string, messages: Record<string, any>): Promise<void> {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await readMessagesRecursively(fullPath, rootDir, messages);
            } else if (entry.name.endsWith('.json')) {
                const relativePath = path.relative(rootDir, fullPath);
                // Transforma o caminho do arquivo em um array de chaves
                // Ex: 'financial/payment-method.json' vira ['financial', 'payment-method']
                const namespaceParts = relativePath
                    .replace(/\\/g, '/') // Garante consistência de separador (Windows)
                    .replace('.json', '')
                    .split('/');

                const fileContent = await fs.readFile(fullPath, 'utf-8');
                
                try {
                    const jsonData = JSON.parse(fileContent);
                    // Constrói o objeto aninhado a partir das partes do caminho
                    createNestedObject(messages, namespaceParts, jsonData);
                } catch (e) {
                    console.error(`Erro ao analisar o arquivo JSON: ${fullPath}`, e);
                }
            }
        }
    } catch (error: any) {
        // Ignora erros de diretório não encontrado para localidades sem traduções
        if (error?.code !== 'ENOENT') {
            console.error(`Erro ao ler o diretório: ${dir}`, error);
        }
    }
}

/**
 * Carrega todos os arquivos de tradução .json para uma localidade, incluindo subdiretórios.
 * @param {string} locale A localidade a ser carregada (ex: 'pt-BR').
 * @returns {Promise<Record<string, any>>} Um objeto aninhado contendo todas as mensagens.
 */
export async function loadMessages(locale: string): Promise<Record<string, any>> {
    const messages: Record<string, any> = {};
    const dir = path.join(process.cwd(), `src/messages/${locale}`);

    await readMessagesRecursively(dir, dir, messages);

    return messages;
}
