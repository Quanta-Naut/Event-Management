import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { type PortfolioItem, type InsertPortfolioItem } from "@shared/schema";

export function usePortfolioItems() {
  return useQuery<PortfolioItem[]>({
    queryKey: ['/api/portfolio'],
  });
}

export function usePortfolioItem(id: number | null) {
  return useQuery<PortfolioItem>({
    queryKey: ['/api/portfolio', id],
    enabled: id !== null,
  });
}

export function useCreatePortfolioItem() {
  return useMutation({
    mutationFn: async (newItem: InsertPortfolioItem) => {
      const response = await apiRequest("POST", "/api/portfolio", newItem);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
    },
  });
}

export function useUpdatePortfolioItem() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPortfolioItem> }) => {
      const response = await apiRequest("PUT", `/api/portfolio/${id}`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio', variables.id] });
    },
  });
}

export function useDeletePortfolioItem() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/portfolio/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
    },
  });
}
