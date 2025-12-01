import { useQuery } from "@tanstack/react-query";
import { TransferFilters, TransferPlayer } from "../types";
import { getTransfers } from "@/lib/api";

export const TRANSFERS_QUERY_KEY = ["transfers"] as const;

const fetchTransfers = async (
  filters: TransferFilters
): Promise<TransferPlayer[]> => {
  const data = await getTransfers(filters);
  return data;
};

export const useTransfersQuery = (filters: TransferFilters) => {
  return useQuery({
    queryKey: [...TRANSFERS_QUERY_KEY, filters],
    queryFn: () => fetchTransfers(filters),
  });
};
