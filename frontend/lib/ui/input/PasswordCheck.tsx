'use client';

import * as React from 'react';
import { InfoFieldValue } from './InfoFieldValue';
import { useTranslations } from 'next-intl';

interface PasswordCheckProps {
  password: string;
  onValidationChange: (isValid: boolean) => void;
}

export const PasswordCheck = ({
  password,
  onValidationChange,
}: PasswordCheckProps) => {
  const t = useTranslations('password-check');
  const specialChars = ' `!@#$%^&*()_+-=[]{};\':"\\|,.<>/?~0123456789';
  const majChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const [passwordCheck, setPasswordCheck] = React.useState({
    length: false,
    min: false,
    maj: false,
    special: false,
  });

  const validatePassword = (newValue: string) => {
    setPasswordCheck({
      length: newValue.length >= 8,
      min: !!majChars
        .toLowerCase()
        .split('')
        .find((c) => newValue.includes(c)),
      maj: !!majChars.split('').find((c) => newValue.includes(c)),
      special: !!specialChars.split('').find((c) => newValue.includes(c)),
    });
  };

  React.useEffect(() => {
    validatePassword(password);
  }, [password]);

  React.useEffect(() => {
    const isValid = Object.values(passwordCheck).every((v) => v);
    onValidationChange(isValid);
  }, [passwordCheck]);

  return (
    <div className="flex flex-col gap-3">
      <InfoFieldValue
        status={passwordCheck.length ? 'success' : 'error'}
        icon={true}
        value={t('length')}
      />
      <InfoFieldValue
        status={passwordCheck.min ? 'success' : 'error'}
        icon={true}
        value={t('lowercase')}
      />
      <InfoFieldValue
        status={passwordCheck.maj ? 'success' : 'error'}
        icon={true}
        value={t('uppercase')}
      />
      <InfoFieldValue
        status={passwordCheck.special ? 'success' : 'error'}
        icon={true}
        value={t('special')}
      />
    </div>
  );
};
