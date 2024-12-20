import NextAuth, { User } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { fetchWithoutCredentials } from './utils';
import { LoginReturn } from '@kata/typings';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const response = await fetchWithoutCredentials<LoginReturn>(
          'auth/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              accept: 'application/json',
            },
            body: Object.entries(credentials)
              .map((e) => e.join('='))
              .join('&'),
          }
        );

        if (!response.success) return null;

        return response.data as User;
      },
    }),
  ],
});
