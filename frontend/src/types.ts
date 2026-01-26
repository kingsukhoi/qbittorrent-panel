export interface File {
    Availability: number;
    Index: number;
    IsSeed: boolean;
    Name: string;
    PieceRange: number[];
    Priority: number;
    Progress: number;
    SizeBytes: number;
}

export interface Tracker {
    Tier: number;
    Url: string;
    Status: string;
    Peers: number;
    Seeds: number;
    Leeches: number;
    TimesDownloaded: number;
    Message: string;
}

export interface Torrent {
    Server: string;
    Name: string;
    Category: string;
    Ratio: number;
    InfoHashV1: string;
    Comment: string;
    RootPath: string;
    SavePath: string;
    SizeBytes: number;
    TrackerUrl: string;
    Trackers: Tracker[];
    Files: File[];
    AddedOn: number;
    State: string;
}

export interface Category {
    Name: string;
    Path: string;
    Servers: string[];
}
