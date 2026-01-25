import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { Control, Controller } from 'react-hook-form';
import { Variable } from './VariableHighlight'; // Importando nossa extensão customizada
import '@mantine/tiptap/styles.css';

type Props = {
    control: Control<any>; // Usamos 'any' para torná-lo reutilizável com diferentes schemas
    onContentChange: (content: string) => void;
};

export default function RichText({ control, onContentChange }: Props) {
    return (
        <>
            {/* Estilos para destacar nossas variáveis. O Tiptap adiciona a classe que definimos na extensão. */}
            <style>{`
                .variable-highlight {
                    background-color: #e9d5ff;
                    color: #5b21b6;
                    padding: 2px 4px;
                    border-radius: 4px;
                    font-weight: 500;
                }
            `}</style>
            <Controller
                name='htmlContent'
                control={control}
                defaultValue="" // Garantimos um valor padrão
                render={({ field }) => {
                    const editor = useEditor({
                        // SOLUÇÃO: Adicionamos a propriedade abaixo para corrigir o erro de SSR.
                        immediatelyRender: false,
                        extensions: [
                            StarterKit,
                            Link,
                            Superscript,
                            SubScript,
                            Highlight,
                            TextAlign.configure({ types: ['heading', 'paragraph'] }),
                            Variable, // Adicionamos nossa extensão aqui
                        ],
                        content: field.value,
                        onUpdate: ({ editor }) => {
                            const html = editor.getHTML();
                            // Atualiza o formulário
                            field.onChange(html);
                            // Notifica o componente pai sobre a mudança
                            onContentChange(html);
                        }
                    });

                    return (
                        <RichTextEditor editor={editor}>
                            <RichTextEditor.Toolbar sticky stickyOffset={60}>
                                <RichTextEditor.ControlsGroup>
                                    <RichTextEditor.Bold />
                                    <RichTextEditor.Italic />
                                    <RichTextEditor.Underline />
                                    <RichTextEditor.Strikethrough />
                                    <RichTextEditor.ClearFormatting />
                                    <RichTextEditor.Highlight />
                                    <RichTextEditor.Code />
                                </RichTextEditor.ControlsGroup>

                                <RichTextEditor.ControlsGroup>
                                    <RichTextEditor.H1 />
                                    <RichTextEditor.H2 />
                                    <RichTextEditor.H3 />
                                    <RichTextEditor.H4 />
                                </RichTextEditor.ControlsGroup>

                                <RichTextEditor.ControlsGroup>
                                    <RichTextEditor.Blockquote />
                                    <RichTextEditor.Hr />
                                    <RichTextEditor.BulletList />
                                    <RichTextEditor.OrderedList />
                                </RichTextEditor.ControlsGroup>

                                <RichTextEditor.ControlsGroup>
                                    <RichTextEditor.Link />
                                    <RichTextEditor.Unlink />
                                </RichTextEditor.ControlsGroup>

                                <RichTextEditor.ControlsGroup>
                                    <RichTextEditor.AlignLeft />
                                    <RichTextEditor.AlignCenter />
                                    <RichTextEditor.AlignJustify />
                                    <RichTextEditor.AlignRight />
                                </RichTextEditor.ControlsGroup>
                            </RichTextEditor.Toolbar>
                            <RichTextEditor.Content />
                        </RichTextEditor>
                    );
                }}
            />
        </>
    );
}
