import {useMutation} from '@tanstack/react-query';
import {graphqlClient} from '../lib/graphqlClient';
import {PAUSE_TORRENTS, RESUME_TORRENTS} from '../queries';

interface TorrentRef {
    Server: string;
    Hash: string;
}

interface MutationArgs {
    Torrents: TorrentRef[];
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
