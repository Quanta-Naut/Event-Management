import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { type Testimonial, type InsertTestimonial } from "@shared/schema";

export function useTestimonials() {
  return useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });
}

export function useCreateTestimonial() {
  return useMutation({
    mutationFn: async (newTestimonial: InsertTestimonial) => {
      const response = await apiRequest("POST", "/api/testimonials", newTestimonial);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
    },
  });
}

export function useUpdateTestimonial() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTestimonial> }) => {
      const response = await apiRequest("PUT", `/api/testimonials/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
    },
  });
}

export function useDeleteTestimonial() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/testimonials/${id}`);
      // Handle 204 No Content response
      return { id, status: response.status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
    },
    // Make sure we don't retry on failed mutations
    retry: false,
  });
}

export function useContactSubmissions() {
  return useQuery({
    queryKey: ['/api/contact'],
  });
}

export function useMarkContactAsRead() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/contact/${id}/read`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    },
  });
}

export function useDeleteContactSubmission() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/contact/${id}`);
      // Handle 204 No Content response
      return { id, status: response.status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    },
    // Make sure we don't retry on failed mutations
    retry: false,
  });
}
