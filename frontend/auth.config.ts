import type { NextAuthConfig } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { IToken, UserAccess } from '@kata/typings';

export const authConfig = {
  debug: Boolean(process.env.AUTH_DEBUG),
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/signout',
  },
  callbacks: {
    authorized({ auth }) {
      const isAuthenticated = !!auth?.user;
      return isAuthenticated;
    },
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      if (user) return { ...token, ...user };

      return token;
    },
    async session({ token, session }) {
      session.user = token.user as UserAccess & AdapterUser;
      session.tokens = token.tokens;

      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

declare module 'next-auth' {
  interface Session {
    user: UserAccess;
    tokens: IToken;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    user: UserAccess;
    tokens: IToken;
  }
}
