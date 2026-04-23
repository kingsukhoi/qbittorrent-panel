import {useQuery} from "@tanstack/react-query";
import {graphqlClient} from "../lib/graphqlClient";
import {GET_CATEGORIES} from "../queries";
import type {Category} from "../types";

export function useCategories() {
	return useQuery({
		queryKey: ["categories"],
		queryFn: () =>
			graphqlClient.request<{ Categories: Category[] }>(GET_CATEGORIES),
		refetchInterval: 5000,
	});
}
