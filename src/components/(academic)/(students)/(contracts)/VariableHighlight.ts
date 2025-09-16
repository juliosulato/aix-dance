import { Mark, markInputRule, mergeAttributes } from '@tiptap/core';

export interface VariableOptions {
  HTMLAttributes: Record<string, any>;
}

// Regex to find words starting with #, allowing hyphens,
// triggered by a space or end of the line.
// Ex: #nome-do-aluno
const VARIABLE_INPUT_REGEX = /(^|\s)(#[\w-]+)$/;

export const Variable = Mark.create<VariableOptions>({
  name: 'variable',

  // Allows other marks (like bold) to be applied over this one.
  inclusive: true,

  // Defines default HTML attributes for the rendered element.
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'variable-highlight',
      },
    };
  },

  // Defines how HTML is parsed to create this mark.
  parseHTML() {
    return [
      {
        tag: 'span[data-variable]',
      },
    ];
  },

  // Defines how this mark is rendered to HTML.
  renderHTML({ HTMLAttributes }) {
    // Returns a <span> tag with merged attributes.
    // '0' means the content inside the mark will be rendered here.
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  
  // Adds input rules to automatically create the mark.
  addInputRules() {
    return [
      markInputRule({
        find: VARIABLE_INPUT_REGEX,
        type: this.type,
      }),
    ];
  },
});
