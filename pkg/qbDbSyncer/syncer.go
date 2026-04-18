package qbDbSyncer

import (
	"context"
	"database/sql"
	"log/slog"
	"time"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/database"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/sqlc"
)

func SyncDbLoop(ctx context.Context) {
	ticker := time.NewTicker(2 * time.Second)
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			errL := syncTorrents(ctx)
			if len(errL) > 0 {
				slog.Error("Error syncing torrents", "error", errL)
			}
			ticker.Reset(2 * time.Second)
		}
	}
}

func syncTorrents(ctx context.Context) []error {

	errorsRtnMe := make([]error, 0)

	currTime := time.Now()

	db := database.MustGet()
	queries := sqlc.New(db)

	clients := qbClient.Registry().All()

	for _, client := range clients {

		errL1 := queries.CreateServer(ctx, sqlc.CreateServerParams{
			Url:      client.BasePath.String(),
			LastSeen: currTime.Unix(),
		})
		if errL1 != nil {
			errorsRtnMe = append(errorsRtnMe, errL1)
			continue
		}

		categories, errL1 := client.GetCategories(ctx)
		if errL1 != nil {
			errorsRtnMe = append(errorsRtnMe, errL1)
			continue
		}

		for _, category := range categories {
			errL2 := queries.CreateCategory(ctx, sqlc.CreateCategoryParams{
				Name:      category.Name,
				SavePath:  category.SavePath,
				ServerUrl: client.BasePath.String(),
			})
			if errL2 != nil {
				errorsRtnMe = append(errorsRtnMe, errL2)
				continue
			}
		}

		torrents, errL1 := client.GetTorrents(ctx)
		if errL1 != nil {
			errorsRtnMe = append(errorsRtnMe, errL1)
			continue
		}

		for _, torrent := range torrents {

			errL2 := queries.CreateTorrent(ctx, sqlc.CreateTorrentParams{
				InfoHashV1:  torrent.InfohashV1,
				ServerUrl:   client.BasePath.String(),
				Name:        torrent.Name,
				LastUpdated: currTime.Unix(),
				Path:        torrent.SavePath,
				Category: sql.NullString{
					String: torrent.Category,
					Valid:  torrent.Category != "",
				},
				Ratio:     torrent.Ratio,
				Comment:   torrent.Comment,
				Rootpath:  torrent.RootPath,
				Savepath:  torrent.SavePath,
				Sizebytes: torrent.Size,
				Addedon:   torrent.AddedOn.Time().Unix(),
				State:     torrent.State,
			})
			if errL2 != nil {
				errorsRtnMe = append(errorsRtnMe, errL2)
				continue
			}
		}
	}

	return errorsRtnMe
}
