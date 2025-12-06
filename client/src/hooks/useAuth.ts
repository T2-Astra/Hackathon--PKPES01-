// From javascript_log_in_with_replit integration
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });
      
      // For auth endpoint, return null on 401 instead of throwing
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
    retry: false,
  });

  // Debug logging
  console.log("useAuth:", { user, isLoading, error, isAuthenticated: !!user });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}