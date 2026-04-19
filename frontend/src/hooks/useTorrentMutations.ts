import {useMutation, useQueryClient} from '@tanstack/react-query';
import {graphqlClient} from '../lib/graphqlClient';
import {CREATE_CATEGORY, PAUSE_TORRENTS, RESUME_TORRENTS} from '../queries';

interface TorrentRef {
    Server: string;
    Hash: string;
}

interface MutationArgs {
    Torrents: TorrentRef[];
}

interface CreateCategoryArgs {
    Name: string;
    Path: string;
    Server: string;
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (args: CreateCategoryArgs) =>
            graphqlClient.request(CREATE_CATEGORY, {args}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['categories']});
        },
    });
}

export function usePauseTorrents() {
    return useMutation({
        mutationFn: (args: MutationArgs) =>
            graphqlClient.request(PAUSE_TORRENTS, {args}),
    });
}

export function useResumeTorrents() {
    return useMutation({
        mutationFn: (args: MutationArgs) =>
            graphqlClient.request(RESUME_TORRENTS, {args}),
    });
}
