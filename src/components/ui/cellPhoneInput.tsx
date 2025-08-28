import { useEffect, useRef, useState } from 'react';
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

// Componente para renderizar a bandeira SVG
function FlagIcon({
  countryCode,
  size = 20,
}: {
  countryCode: string;
  size?: number;
}) {
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
}

function CountryFlag({ countryCode, size = 20 }: { countryCode: string; size?: number }) {
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
}

// Fallback para emoji (caso a imagem não carregue)
function getFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (code.length !== 2) return countryCode;
  
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
      return String.fromCodePoint(...codePoints);
    }
  } catch (error) {
    console.warn(`Erro ao gerar emoji para país ${countryCode}:`, error);
  }
  
  return countryCode;
}

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
        },
      ] as [
        CountryCode,
        {
          code: CountryCode;
          name: string;
        },
      ];
    })
    .filter((o) => !!o),
);

const countryOptionsData = Object.values(countryOptionsDataMap);

type Country = (typeof countryOptionsData)[number];

function getFormat(countryCode: CountryCode) {
  const example = getExampleNumber(countryCode, examples)!.formatNational();
  const mask = example.replace(/\d/g, '0');
  return { example, mask };
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

export function PhoneInput({
  initialCountryCode = 'BR',
  value: _value,
  onChange: _onChange,
  defaultValue,
  ...props
}: PhoneInputProps) {
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
useEffect(() => {
  let e164 = '';
  if (localValue.trim().length > 0) {
    const asYouType = new AsYouType(country.code);
    asYouType.input(localValue);
    e164 = asYouType.getNumber()?.number ?? '';
  }
  if (e164 !== lastNotifiedValue.current) {
    lastNotifiedValue.current = e164;
    onChange(e164); // <- envia null quando vazio
  }
}, [country.code, localValue, onChange]);

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
}, [_value]); // <- só _value


  const { readOnly, disabled } = props;
  const leftSectionWidth = 54;


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
            setCountry={(newCountry) => {
              console.log('Mudando país para:', newCountry);
              setCountry(newCountry);
              setFormat(getFormat(newCountry.code));
              setLocalValue('');
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
            leftSectionWidth={leftSectionWidth}
          />
        ) : null
      }
      leftSectionWidth={leftSectionWidth}
      styles={{
        input: {
          paddingLeft: `calc(${leftSectionWidth}px + var(--mantine-spacing-sm))`,
        },
        section: {
          borderRight: '1px solid var(--mantine-color-default-border)',
        },
      }}
      inputMode="numeric"
      mask={format.mask}
      unmask={true}
      value={localValue}
      onAccept={(value) => setLocalValue(value)}
    />
  );
}

function CountrySelect({
  country,
  setCountry,
  disabled,
  leftSectionWidth,
}: {
  country: Country;
  setCountry: (country: Country) => void;
  disabled: boolean | undefined;
  leftSectionWidth: number;
}) {
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

  const options = countryOptionsData
    .filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase().trim()),
    )
    .map((item) => (
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

  useEffect(() => {
    if (search) {
      combobox.selectFirstOption();
    }
  }, [search]);

  // Se não tem país, não renderiza nada
  if (!country) {
    return null;
  }

  return (
    <Combobox
      store={combobox}
      width={250}
      position="bottom-start"
      withArrow
      onOptionSubmit={(val) => {
        const selectedCountry = countryOptionsDataMap[val];
        if (selectedCountry) {
          setCountry(selectedCountry);
          combobox.closeDropdown();
        }
      }}
    >
      <Combobox.Target withAriaAttributes={false}>
        <ActionIcon
          variant="transparent"
          onClick={() => combobox.toggleDropdown()}
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
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
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
}