import { Prisma } from '@kata/prisma';

const numberToStringSpaces = (
  number?: number | Prisma.Decimal,
  suffix?: string
) => {
  let number_with_space = '0';

  if (!number) {
    return suffix ? `${number_with_space} ${suffix}` : number_with_space;
  }

  const decimal_number = new Prisma.Decimal(number);
  const formatted_number = decimal_number.toDecimalPlaces(2);

  number_with_space = formatted_number.isInteger()
    ? formatted_number.toString()
    : formatted_number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return suffix ? `${number_with_space}${suffix}` : number_with_space;
};

const capitalize = (word: string): string => {
  return !word ? '' : word[0].toUpperCase() + word.substring(1).toLowerCase();
};

function removeExtraSpaces(str: string) {
  return str.trim().replace(/\s+/g, ' ');
}

function enumValueToPath(value: string): string {
  return value.toLowerCase().replace(/_/g, '-');
}

function pathToEnumValue<T>(path: string): T {
  return path.toUpperCase().replace(/-/g, '_') as T;
}

function urlSafeToken(token: string): string {
  return token.replace(/\//g, '_').replace(/\./g, '~').replace(/=+$/, '');
}

function decodeUrlSafeToken(token: string): string {
  return token.replace(/_/g, '/').replace(/\~/g, '.');
}

export {
  numberToStringSpaces,
  capitalize,
  removeExtraSpaces,
  enumValueToPath,
  pathToEnumValue,
  urlSafeToken,
  decodeUrlSafeToken,
};
