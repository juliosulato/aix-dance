import { ReactNode } from 'react';

type TranslateArgs<Value, TArgs> = any; // aqui depende da implementação do next-intl
type RichTagsFunction = Record<string, (...args: any[]) => ReactNode>;
type MarkupTagsFunction = Record<string, (...args: any[]) => string>;
type NestedValueOf<T, K extends string> = any; // pode usar utilitária para mapear nested keys

export type Translations = {
  <TargetKey extends string>(
    key: TargetKey,
    ...args: TranslateArgs<NestedValueOf<Record<string, any>, `${TargetKey}`>, never>
  ): string;

  rich<TargetKey extends string>(
    key: TargetKey,
    ...args: TranslateArgs<NestedValueOf<Record<string, any>, `${TargetKey}`>, RichTagsFunction>
  ): ReactNode;

  markup<TargetKey extends string>(
    key: TargetKey,
    ...args: TranslateArgs<NestedValueOf<Record<string, any>, `${TargetKey}`>, MarkupTagsFunction>
  ): string;

  raw<TargetKey extends string>(key: TargetKey): any;

  has<TargetKey extends string>(key: TargetKey): boolean;
};
