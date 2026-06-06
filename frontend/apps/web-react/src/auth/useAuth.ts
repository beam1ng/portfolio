import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { ApiError, type AuthUser } from '@portfolio/api-client';
import { api } from '../lib/apiClient';

const ME_KEY = ['auth', 'me'] as const;

/**
 * Resolves the current admin from the auth cookie. A 401 is an expected
 * "logged out" state, not a retryable error.
 */
export function useCurrentUser(): UseQueryResult<AuthUser> {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: ({ signal }) => api.auth.me(signal),
    retry: (_count, error) => !(error instanceof ApiError && error.status === 401),
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.auth.login(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(ME_KEY, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      queryClient.setQueryData(ME_KEY, null);
      void queryClient.invalidateQueries();
    },
  });
}
