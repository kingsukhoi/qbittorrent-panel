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
    Files: File[];
    AddedOn: number;
    State: string;
}

export interface Category {
    Name: string;
    Path: string;
    Servers: string[];
}
