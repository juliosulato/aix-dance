import { Mark, markInputRule, mergeAttributes } from '@tiptap/core';

export interface VariableOptions {
  HTMLAttributes: Record<string, any>;
}

// Regex para encontrar palavras entre chaves duplas {{variavel-exemplo}}
// Ativado ao digitar a segunda chave de fechamento.
const VARIABLE_INPUT_REGEX = /\{\{([\w-]+)\}\}/g;

export const Variable = Mark.create<VariableOptions>({
  name: 'variable',

  // Permite que outras marcas (como negrito) sejam aplicadas sobre esta.
  inclusive: true,

  // Define os atributos HTML padrão para o elemento renderizado.
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'variable-highlight', // Classe CSS que usaremos para estilizar
      },
    };
  },

  // Define como o HTML é interpretado para criar esta marca no editor.
  parseHTML() {
    return [
      {
        tag: 'span.variable-highlight', // Reconhece spans com nossa classe
      },
    ];
  },

  // Define como esta marca é renderizada para o HTML final.
  renderHTML({ HTMLAttributes }) {
    // Retorna uma tag <span> com os atributos mesclados.
    // O '0' significa que o conteúdo dentro da marca será renderizado aqui.
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  // Adiciona regras de input para criar a marca automaticamente enquanto o usuário digita.
  // No nosso caso, a detecção é feita pelo componente pai, então esta parte não é estritamente
  // necessária para o highlight, mas é uma boa prática em extensões Tiptap.
  // A lógica principal de highlight virá da detecção e re-renderização.
});
