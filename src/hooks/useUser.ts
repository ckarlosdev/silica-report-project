import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { api } from "./apiConfig";

const queryMe = async () => {
  const { data } = await api.get("auth/me");
  return data;
};

function useUser() {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: ["user", token],
    queryFn: queryMe,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}

export default useUser;
