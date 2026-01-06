// src/config/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data "fresh" trong 5 phút
      cacheTime: 10 * 60 * 1000, // Giữ cache 10 phút
      refetchOnWindowFocus: false, // Không refetch khi focus window
      refetchOnMount: false, // Không refetch khi component mount lại
      retry: 1, // Chỉ retry 1 lần nếu fail
    },
  },
});