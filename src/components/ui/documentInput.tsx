import { useEffect, useState } from 'react';
import { Flex, InputBase, InputBaseProps } from '@mantine/core';
import { IMaskInput } from 'react-imask';
import { americaDocumentOptions } from '@/utils/americaDocumentOptions';
import { europeDocumentOptions } from '@/utils/europeDocumentOptions';
import { useSession } from 'next-auth/react';

const documentOptions: Record<string, { label: string; mask?: string }> = {};
americaDocumentOptions.forEach(doc => {
  documentOptions[doc.value] = { label: doc.label, mask: doc.mask };
});
europeDocumentOptions.forEach(doc => {
  documentOptions[doc.value] = { label: doc.label, mask: doc.mask };
});

type DocumentInputProps = InputBaseProps & {
  value?: string;
  onChange?: (val: string) => void;
};

export default function DocumentInput({ value: controlledValue, onChange, ...props }: DocumentInputProps) {
  const { data: session } = useSession();
  const [mask, setMask] = useState<string>('000.000.000-00');
  const [label, setLabel] = useState<string>('CPF');
  const [value, setValue] = useState<string>(controlledValue || '');

  useEffect(() => {
    const country = session?.user?.country || 'BR';
    const doc = documentOptions[country] || documentOptions['BR'];
    setLabel(doc.label);
    setMask(doc.mask || '');
    setValue(controlledValue || '');
  }, [controlledValue, session]);

  return (
    <Flex gap="0" align="flex-end">
      <InputBase
        label={label}
        placeholder={`Digite o ${label}`}
        component={IMaskInput}
        mask={mask || undefined}
        value={value}
        onAccept={(val: string) => {
          setValue(val);
          onChange?.(val);
        }}
        {...props} // mantém todas as props do Mantine
        style={{ width: '100%' }}
      />
    </Flex>
  );
}
