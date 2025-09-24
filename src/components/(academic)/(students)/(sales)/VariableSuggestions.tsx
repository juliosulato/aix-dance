import { notifications } from "@mantine/notifications";

// Lista de variáveis disponíveis, agrupadas por categoria.
// Você pode expandir esta lista com base no seu modelo de dados no Prisma.
const variableGroups = [
  { 
    groupKey: 'student', 
    variables: [
        '#aluno-nome-completo', '#aluno-primeiro-nome', '#aluno-sobrenome', '#aluno-email',
        '#aluno-celular', '#aluno-data-nascimento', '#aluno-rg'
    ]
  },
  { 
    groupKey: 'guardian', 
    variables: [
        '#responsavel-nome-completo', '#responsavel-rg', '#responsavel-email', '#responsavel-celular'
    ]
  },
  { 
    groupKey: 'tenancy', 
    variables: [
        '#empresa-nome', '#empresa-cnpj', '#empresa-email', '#empresa-telefone', '#empresa-endereco-completo'
    ]
  },
  { 
    groupKey: 'plan', 
    variables: [
        '#plano-nome', '#plano-valor-mensal', '#data-inicio-contrato'
    ]
  },
  { 
    groupKey: 'general', 
    variables: [
        '#data-atual-extenso'
    ]
  },
];

export default function VariableSuggestions() {

    // Função para copiar texto para a área de transferência.
    // Usando `document.execCommand` para maior compatibilidade em iframes.
    const copyToClipboard = (text: string) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = "fixed"; // Previne rolagem da página.
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            notifications.show({
                message: `Variável copiada: ${text}`,
                color: 'green',
            });
        } catch (err) {
            console.error('Falha ao copiar texto: ', err);
            notifications.show({
                message: "Falha ao copiar para a área de transferência.",
                color: 'red',
            });
        }
        document.body.removeChild(textArea);
    };

    return (
        <div className="p-4 border rounded-lg bg-neutral-50 h-full">
            <h3 className="font-semibold text-gray-800 mb-2">{"Variáveis Disponíveis"}</h3>
            <p className="text-sm text-gray-600 mb-4">
                {"Clique em uma variável para copiá-la e colar no modelo de venda."}
            </p>
            <div className="space-y-4">
                {variableGroups.map(({ groupKey, variables }) => (
                    <div key={groupKey}>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">{(() => {
                            switch(groupKey) {
                                case 'student': return 'Aluno';
                                case 'guardian': return 'Responsável';
                                case 'tenancy': return 'Empresa';
                                case 'plan': return 'Plano';
                                case 'general': return 'Geral';
                                default: return groupKey;
                            }
                        })()}</h4>
                        <div className="flex flex-wrap gap-2">
                            {variables.map(variable => (
                                <button
                                    key={variable}
                                    type="button"
                                    onClick={() => copyToClipboard(variable)}
                                    className="bg-purple-100 text-purple-800 text-xs font-mono py-1 px-2 rounded-md hover:bg-purple-200 transition-colors"
                                    title={"Copiar variável"}
                                >
                                    {variable}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
