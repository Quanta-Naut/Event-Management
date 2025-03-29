import { useQuery, useMutation } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { apiRequest, getQueryFn, queryClient } from '@/lib/queryClient';

export function useAdminUsers() {
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string }) => {
      const res = await apiRequest('POST', '/api/admin/users', userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  return {
    users,
    isLoading,
    error,
    createUserMutation,
    deleteUserMutation,
  };
}