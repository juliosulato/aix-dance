import { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';
import {
  useCombobox,
  Combobox,
  Group,
  CheckIcon,
  ScrollArea,
  InputBase,
  ActionIcon,
  type InputBaseProps,
  type PolymorphicComponentProps,
} from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import countries from 'i18n-iso-countries';
import es from 'i18n-iso-countries/langs/es.json';
import {
  getExampleNumber,
  type CountryCode,
  parsePhoneNumberFromString,
  getCountries,
  AsYouType,
} from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import { IMaskInput } from 'react-imask';
import { BiChevronDown } from 'react-icons/bi';

countries.registerLocale(es);

// Componente para renderizar a bandeira SVG - Memoizado
const FlagIcon = memo(({
  countryCode,
  size = 20,
}: {
  countryCode: string;
  size?: number;
}) => {
  const code = countryCode.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={`${countryCode} flag`}
      width={size}
      height={Math.round(size * 0.75)}
      style={{
        borderRadius: 2,
        objectFit: 'cover',
        display: 'block',
        margin: 'auto',
      }}
      referrerPolicy="no-referrer"
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        const fallback = img.nextElementSibling as HTMLElement | null;
        if (fallback) {
          img.style.display = 'none';
          fallback.style.display = 'inline-flex';
          fallback.style.alignItems = 'center';
          fallback.style.justifyContent = 'center';
        }
      }}
    />
  );
});

FlagIcon.displayName = 'FlagIcon';

const CountryFlag = memo(({ countryCode, size = 20 }: { countryCode: string; size?: number }) => {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: Math.round(size * 0.75),
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <FlagIcon countryCode={countryCode} size={size} />
      <span
        style={{
          display: 'none',
          fontSize: `${Math.round(size * 0.8)}px`,
          lineHeight: 1,
        }}
      >
        {getFlagEmoji(countryCode)}
      </span>
    </span>
  );
});

CountryFlag.displayName = 'CountryFlag';

// Cache do emoji para evitar recálculos
const flagEmojiCache = new Map<string, string>();

// Fallback para emoji (caso a imagem não carregue) - Com cache
function getFlagEmoji(countryCode: string): string {
  if (flagEmojiCache.has(countryCode)) {
    return flagEmojiCache.get(countryCode)!;
  }

  const code = countryCode.toUpperCase();
  if (code.length !== 2) {
    flagEmojiCache.set(countryCode, countryCode);
    return countryCode;
  }
  
  try {
    const codePoints = code
      .split('')
      .map((char) => {
        const charCode = char.charCodeAt(0);
        if (charCode >= 65 && charCode <= 90) {
          return 127462 + charCode - 65;
        }
        return null;
      })
      .filter((point): point is number => point !== null);
    
    if (codePoints.length === 2) {
      const emoji = String.fromCodePoint(...codePoints);
      flagEmojiCache.set(countryCode, emoji);
      return emoji;
    }
  } catch (error) {
    console.warn(`Erro ao gerar emoji para país ${countryCode}:`, error);
  }
  
  flagEmojiCache.set(countryCode, countryCode);
  return countryCode;
}

// Cachear os dados dos países para evitar recálculos
const libIsoCountries = countries.getNames('es', { select: 'official' });
const libPhoneNumberCountries = getCountries();

const countryOptionsDataMap = Object.fromEntries(
  libPhoneNumberCountries
    .map((code) => {
      const name = libIsoCountries[code];
      if (!name) return null;
      
      return [
        code,
        {
          code,
          name,
          // Pré-computar texto de busca para otimizar filtro
          searchText: name.toLowerCase(),
        },
      ] as [
        CountryCode,
        {
          code: CountryCode;
          name: string;
          searchText: string;
        },
      ];
    })
    .filter((o) => !!o),
);

const countryOptionsData = Object.values(countryOptionsDataMap);

type Country = (typeof countryOptionsData)[number];

// Cache para formatos de países
const formatCache: any = new Map<CountryCode, ReturnType<typeof getFormat>>();

function getFormat(countryCode: CountryCode) {
  if (formatCache.has(countryCode)) {
    return formatCache.get(countryCode)!;
  }

  const example = getExampleNumber(countryCode, examples)!.formatNational();
  const mask = example.replace(/\d/g, '0');
  const format = { example, mask };
  
  formatCache.set(countryCode, format);
  return format;
}

function getInitialDataFromValue(
  value: string | undefined,
  options: {
    initialCountryCode: string;
  },
): {
  country: Country;
  format: ReturnType<typeof getFormat>;
  localValue: string;
} {
  const defaultCountry = countryOptionsDataMap[options.initialCountryCode];
  const defaultValue = {
    country: defaultCountry,
    format: getFormat(options.initialCountryCode as CountryCode),
    localValue: '',
  };
  
  // Se não tem valor ou país padrão não existe, retorna o padrão
  if (!value || !defaultCountry) return defaultValue;
  
  const phoneNumber = parsePhoneNumberFromString(value);
  if (!phoneNumber || !phoneNumber.country) return defaultValue;
  
  const countryData = countryOptionsDataMap[phoneNumber.country];
  if (!countryData) return defaultValue;
  
  return {
    country: countryData,
    localValue: phoneNumber.formatNational(),
    format: getFormat(phoneNumber.country),
  };
}

export type PhoneInputProps = {
  initialCountryCode?: string;
  defaultValue?: string;
} & Omit<
  PolymorphicComponentProps<typeof IMaskInput, InputBaseProps>,
  'onChange' | 'defaultValue'
> & { onChange: (value: string | null) => void };

export const PhoneInput = memo(({
  initialCountryCode = 'BR',
  value: _value,
  onChange: _onChange,
  defaultValue,
  ...props
}: PhoneInputProps) => {
  const [value, onChange] = useUncontrolled({
    value: _value,
    defaultValue,
    onChange: _onChange,
  });
  
  const initialData = useRef(
    getInitialDataFromValue(value, {
      initialCountryCode: initialCountryCode,
    }),
  );
  
  const [country, setCountry] = useState(initialData.current.country);
  const [format, setFormat] = useState(initialData.current.format);
  const [localValue, setLocalValue] = useState(initialData.current.localValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastNotifiedValue = useRef<string | null>(value ?? '');

  // Otimizar o efeito de notificação de mudanças
  const notifyChange = useCallback((newLocalValue: string, countryCode: CountryCode) => {
    let e164 = '';
    if (newLocalValue.trim().length > 0) {
      const asYouType = new AsYouType(countryCode);
      asYouType.input(newLocalValue);
      e164 = asYouType.getNumber()?.number ?? '';
    }
    
    if (e164 !== lastNotifiedValue.current) {
      lastNotifiedValue.current = e164;
      onChange(e164);
    }
  }, [onChange]);

  useEffect(() => {
    notifyChange(localValue, country.code);
  }, [country.code, localValue, notifyChange]);

  useEffect(() => {
    // Só reage quando o valor controlado externo muda
    if (typeof _value === 'undefined') return;
    if (_value === lastNotifiedValue.current) return;

    const parsed = parsePhoneNumberFromString(_value || '');
    // Se não dá pra inferir país com confiança, não mexe em nada
    if (!parsed || !parsed.country) return;

    const data = countryOptionsDataMap[parsed.country];
    if (!data) return;

    lastNotifiedValue.current = _value;

    if (parsed.country !== country.code) {
      setCountry(data);
      setFormat(getFormat(parsed.country));
    }
    setLocalValue(parsed.formatNational());
  }, [_value, country.code]);

  const { readOnly, disabled } = props;
  const leftSectionWidth = 54;

  // Handler otimizado para mudança de país
  const handleCountryChange = useCallback((newCountry: Country) => {
    console.log('Mudando país para:', newCountry);
    setCountry(newCountry);
    setFormat(getFormat(newCountry.code));
    setLocalValue('');
    
    // Focus otimizado
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
  }, []);

  // Handler otimizado para accept do mask
  const handleAccept = useCallback((value: string) => {
    setLocalValue(value);
  }, []);

  // Memoizar estilos para evitar re-renders desnecessários
  const inputStyles = useMemo(() => ({
    input: {
      paddingLeft: `calc(${leftSectionWidth}px + var(--mantine-spacing-sm))`,
    },
    section: {
      borderRight: '1px solid var(--mantine-color-default-border)',
    },
  }), [leftSectionWidth]);

  return (
    <InputBase
      {...props}
      component={IMaskInput}
      inputRef={inputRef}
      leftSection={
        country ? (
          <CountrySelect
            disabled={disabled || readOnly}
            country={country}
            setCountry={handleCountryChange}
            leftSectionWidth={leftSectionWidth}
          />
        ) : null
      }
      leftSectionWidth={leftSectionWidth}
      styles={inputStyles}
      inputMode="numeric"
      mask={format.mask}
      unmask={true}
      value={localValue}
      onAccept={handleAccept}
    />
  );
});

PhoneInput.displayName = 'PhoneInput';

// Componente CountrySelect otimizado
const CountrySelect = memo(({
  country,
  setCountry,
  disabled,
  leftSectionWidth,
}: {
  country: Country;
  setCountry: (country: Country) => void;
  disabled: boolean | undefined;
  leftSectionWidth: number;
}) => {
  const [search, setSearch] = useState('');
  const selectedRef = useRef<HTMLDivElement>(null);

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      setSearch('');
    },
    onDropdownOpen: () => {
      combobox.focusSearchInput();
      setTimeout(() => {
        selectedRef.current?.scrollIntoView({
          behavior: 'instant',
          block: 'center',
        });
      }, 0);
    },
  });

  // Otimizar filtro com useMemo e busca pré-computada
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return countryOptionsData;
    
    const searchTerm = search.toLowerCase().trim();
    return countryOptionsData.filter((item) =>
      item.searchText.includes(searchTerm)
    );
  }, [search]);

  // Memoizar as opções para evitar re-renders desnecessários
  const options = useMemo(() => {
    return filteredOptions.map((item) => (
      <Combobox.Option
        ref={item.code === country.code ? selectedRef : undefined}
        value={item.code}
        key={item.code}
      >
        <Group gap="xs">
          {item.code === country.code && <CheckIcon size={12} />}
          <Group gap="xs">
            <CountryFlag countryCode={item.code} size={20} />
            <span>{item.name}</span>
          </Group>
        </Group>
      </Combobox.Option>
    ));
  }, [filteredOptions, country.code]);

  // Handler otimizado para mudança de busca
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
  }, []);

  // Handler otimizado para submit de opção
  const handleOptionSubmit = useCallback((val: string) => {
    const selectedCountry = countryOptionsDataMap[val];
    if (selectedCountry) {
      setCountry(selectedCountry);
      combobox.closeDropdown();
    }
  }, [setCountry, combobox]);

  // Handler otimizado para toggle
  const handleToggle = useCallback(() => {
    combobox.toggleDropdown();
  }, [combobox]);

  useEffect(() => {
    if (search) {
      combobox.selectFirstOption();
    }
  }, [search, combobox]);

  // Se não tem país, não renderiza nada
  if (!country) {
    return null;
  }

  // Memoizar o ActionIcon para evitar re-renders
  const actionIcon = useMemo(() => (
    <ActionIcon
      variant="transparent"
      onClick={handleToggle}
      size="lg"
      tabIndex={-1}
      disabled={disabled}
      w={leftSectionWidth}
      c="dimmed"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Group gap={4} style={{ alignItems: 'center' }}>
        <CountryFlag countryCode={country.code} size={16} />
        <BiChevronDown size={12} />
      </Group>
    </ActionIcon>
  ), [handleToggle, disabled, leftSectionWidth, country.code]);

  return (
    <Combobox
      store={combobox}
      width={250}
      position="bottom-start"
      withArrow
      onOptionSubmit={handleOptionSubmit}
    >
      <Combobox.Target withAriaAttributes={false}>
        {actionIcon}
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          value={search}
          onChange={handleSearchChange}
          placeholder="Buscar país"
        />
        <Combobox.Options>
          <ScrollArea.Autosize mah={200} type="scroll">
            {options.length > 0 ? (
              options
            ) : (
              <Combobox.Empty>No encontrado</Combobox.Empty>
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
});

CountrySelect.displayName = 'CountrySelect';