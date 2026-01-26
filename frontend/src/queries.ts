import {gql} from '@apollo/client';

export const GET_TORRENTS = gql`
    query GetTorrents($categories: [String!], $servers: [String!]) {
        Torrents(categories: $categories, servers: $servers) {
            Server
            Name
            Category
            Ratio
            InfoHashV1
            Comment
            RootPath
            SavePath
            SizeBytes
            TrackerUrl
            AddedOn
            State
            Files {
                Availability
                Index
                IsSeed
                Name
                PieceRange
                Priority
                Progress
                SizeBytes
            }
        }
    }
`;

export const GET_TORRENT_TRACKERS = gql`
    query GetTorrentTrackers($infoHashV1: String!) {
        Torrent(infoHashV1: $infoHashV1) {
            InfoHashV1
            Server
            Trackers {
                Tier
                Url
                Status
                Peers
                Seeds
                Leeches
                TimesDownloaded
                Message
            }
        }
    }
`;

export const GET_CATEGORIES = gql`
    query GetCategories {
        Categories {
            Name
            Path
            Servers
        }
    }
`;

export const PAUSE_TORRENTS = gql`
    mutation PauseTorrents($args: PauseTorrentsArgs!) {
        pauseTorrents(args: $args) {
            Success
        }
    }
`;

export const RESUME_TORRENTS = gql`
    mutation ResumeTorrents($args: ResumeTorrentsArgs!) {
        resumeTorrents(args: $args) {
            Success
        }
    }
`;
