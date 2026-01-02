import { WorkspaceMembership } from '@/lib/types';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      workspaceId: string;
      workspaces: WorkspaceMembership[];
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    workspaceId: string;
    token: string;
    workspaces: WorkspaceMembership[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    workspaceId?: string;
    workspaces?: WorkspaceMembership[];
  }
}

