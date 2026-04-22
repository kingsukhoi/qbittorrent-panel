import {useQuery} from "@tanstack/react-query";
import {graphqlClient} from "../lib/graphqlClient";
import {GET_TORRENTS} from "../queries";
import type {Torrent} from "../types";

interface TorrentsVariables {
    categories?: string[];
    servers?: string[];
}

export function useTorrents(variables?: TorrentsVariables) {
    return useQuery({
        queryKey: ["torrents", variables ?? {}],
        queryFn: () =>
            graphqlClient.request<{
                Torrents: Torrent[];
            }>(GET_TORRENTS, variables as Record<string, unknown>),
        refetchInterval: 2000,
    });
}
