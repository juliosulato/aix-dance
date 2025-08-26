import { useEffect, useState } from 'react';
import { Select, Flex, InputBase } from '@mantine/core';
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

declare module "next-auth" {
    interface Session {
        user: User
    }
    
    interface User {
        country?: string
    }
}

export default function DocumentInput() {
    const { data: session } = useSession();
    const [mask, setMask] = useState<string>('000.000.000-00');
    const [value, setValue] = useState<string>('');
    const [label, setLabel] = useState<string>('CPF');

    useEffect(() => {
        const country = session?.user?.country || 'BR';
        const doc = documentOptions[country] || documentOptions['BR'];
        setLabel(doc.label);
        setMask(doc.mask || '');
        setValue('');
    }, [session]);

    return (
        <Flex gap="0" align="flex-end">
            <InputBase
                label={label}
                placeholder={`Digite o ${label}`}
                component={IMaskInput}
                mask={mask || undefined}
                classNames={{ input: "!rounded" }}
                value={value}
                onAccept={(val: string) => setValue(val)}
                style={{ width: '100%' }}
            />
        </Flex>
    );
}

