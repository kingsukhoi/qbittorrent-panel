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

func (t *TorrentTracker) StatusString() string {
	switch t.Status {
	case 0:
		return "Disabled"
	case 1:
		return "Not Contacted"
	case 2:
		return "Working"
	case 3:
		return "Updating"
	case 4:
		return "Not Working"
	}
	return "Unknown"
}
