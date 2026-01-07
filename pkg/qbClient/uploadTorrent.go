package qbClient

import "io"

type UploadTorrentInfo struct {
	Filename string
	File     io.ReadSeeker
}
