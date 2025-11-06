package qbClient

type TorrentFile struct {
	Availability float64 `json:"availability"`
	Index        int     `json:"index"`
	Name         string  `json:"name"`
	PieceRange   []int   `json:"piece_range"`
	Priority     int     `json:"priority"`
	Progress     float64 `json:"progress"`
	Size         int64   `json:"size"`
	IsSeed       bool    `json:"is_seed,omitempty"`
}
