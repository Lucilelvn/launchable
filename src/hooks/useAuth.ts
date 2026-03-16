import { useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
import { getInitials } from '../lib/auth';
import type { User } from '../lib/auth';

export function useAuth() {
  const { signIn, signOut } = useAuthActions();
  const convexUser = useQuery(api.users.currentUser);

  const user: User | null = convexUser
    ? {
        name: convexUser.name ?? convexUser.email ?? 'User',
        initials: getInitials(convexUser.name ?? convexUser.email ?? 'U'),
        email: convexUser.email,
        avatarUrl: convexUser.image,
      }
    : null;

  const isLoading = convexUser === undefined;

  function signInWithGoogle() {
    void signIn('google');
  }

  function handleSignOut() {
    void signOut();
  }

  return { user, isLoading, signIn: signInWithGoogle, signOut: handleSignOut };
}
