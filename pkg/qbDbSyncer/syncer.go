package qbDbSyncer

import (
	"context"
	"log/slog"
	"sync"
	"time"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/database"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/sqlc"
)

var lock sync.Mutex

func SyncDbLoop(ctx context.Context) {
	ticker := time.NewTicker(2 * time.Second)
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			locked := lock.TryLock()
			if !locked {
				slog.Error("Failed to acquire lock")
				continue
			}
			errL := syncTorrents(ctx)
			if errL != nil {
				slog.Error("Error syncing torrents", "error", errL)
			}
			lock.Unlock()
		}
	}
}

func syncTorrents(ctx context.Context) error {
	currTime := time.Now()

	db := database.MustGet()
	queries := sqlc.New(db)

	clients := qbClient.Registry().All()

	for _, client := range clients {
		torrents, errL1 := client.GetTorrents(ctx)
		if errL1 != nil {
			return errL1
		}
		for _, torrent := range torrents {
			errL2 := queries.CreateTorrent(ctx, sqlc.CreateTorrentParams{
				InfoHashV1:  torrent.InfohashV1,
				ServerUrl:   client.BasePath.String(),
				Name:        torrent.Name,
				LastUpdated: currTime.Unix(),
				Path:        torrent.SavePath,
			})
			if errL2 != nil {
				return errL2
			}
		}
	}

	return nil
}
