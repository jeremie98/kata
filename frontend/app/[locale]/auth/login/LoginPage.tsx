'use client';

import * as React from 'react';
import { Toaster } from '@/lib';
import { LoginForm } from './LoginForm';

export const LoginPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <LoginForm />
      <Toaster />
    </div>
  );
};
