import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import axios from 'axios';
import { AuthResponsePayload, WorkspaceMembership } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const authConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const response = await axios.post<{ success: boolean; data: AuthResponsePayload }>(
            `${API_BASE_URL}/api/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          const payload = response.data.data;
          return {
            id: payload.user.userId,
            email: payload.user.email,
            workspaceId: payload.user.workspaceId,
            token: payload.token,
            workspaces: payload.workspaces,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as unknown as Record<string, string>).token;
        token.workspaceId = (user as unknown as Record<string, string>).workspaceId;
        token.workspaces = (user as unknown as { workspaces?: WorkspaceMembership[] }).workspaces;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.sub as string,
          workspaceId: token.workspaceId as string,
          workspaces: (token.workspaces as WorkspaceMembership[]) || [],
        };
      }
      (session as Record<string, unknown>).accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const { handlers } = NextAuth(authConfig);

export const { GET, POST } = handlers;

