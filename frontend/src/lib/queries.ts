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
      Tracker
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

export const GET_CATEGORIES = gql`
  query GetCategories {
    Categories {
      Name
      Path
      Servers
    }
  }
`;

export const GET_TORRENT = gql`
  query GetTorrent($infoHashV1: String!) {
    Torrent(infoHashV1: $infoHashV1) {
      Server
      Name
      Category
      Ratio
      InfoHashV1
      Comment
      RootPath
      SavePath
      SizeBytes
      Tracker
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

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($args: CreateCategoryArgs!) {
    createCategory(args: $args) {
      Success
    }
  }
`;

export const UPLOAD_TORRENT = gql`
  mutation UploadTorrent($args: UploadTorrentArgs!) {
    uploadTorrent(args: $args) {
      Success
    }
  }
`;
