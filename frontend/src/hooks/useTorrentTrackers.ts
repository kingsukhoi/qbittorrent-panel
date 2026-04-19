import {useQuery} from '@tanstack/react-query';
import {graphqlClient} from '../lib/graphqlClient';
import {GET_TORRENT_TRACKERS} from '../queries';
import type {Torrent} from '../types';

export function useTorrentTrackers(infoHashV1: string | undefined, enabled: boolean) {
    return useQuery({
        queryKey: ['torrent-trackers', infoHashV1],
        queryFn: () => graphqlClient.request<{ Torrent: Torrent[] }>(GET_TORRENT_TRACKERS, {infoHashV1}),
        enabled: enabled && !!infoHashV1,
    });
}
