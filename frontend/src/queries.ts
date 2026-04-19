export const GET_TORRENTS = `
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

export const GET_TORRENT_TRACKERS = `
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

export const GET_CATEGORIES = `
    query GetCategories {
        Categories {
            Name
            Path
            Servers
        }
    }
`;

export const CREATE_CATEGORY = `
    mutation CreateCategory($args: CreateCategoryArgs!) {
        createCategory(args: $args) {
            Success
        }
    }
`;

export const PAUSE_TORRENTS = `
    mutation PauseTorrents($args: PauseTorrentsArgs!) {
        pauseTorrents(args: $args) {
            Success
        }
    }
`;

export const RESUME_TORRENTS = `
    mutation ResumeTorrents($args: ResumeTorrentsArgs!) {
        resumeTorrents(args: $args) {
            Success
        }
    }
`;
