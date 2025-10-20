package qbClient

type TorrentTracker struct {
	Msg           string `json:"msg"`
	NumDownloaded int    `json:"num_downloaded"`
	NumLeeches    int    `json:"num_leeches"`
	NumPeers      int    `json:"num_peers"`
	NumSeeds      int    `json:"num_seeds"`
	Status        int    `json:"status"`
	Tier          int    `json:"tier"`
	Url           string `json:"url"`
}
