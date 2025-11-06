package commands

import (
	"context"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/handleOutputs"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
)

type ListAbandonedTorrents struct{}

func (d *ListAbandonedTorrents) Run(globals *Globals, ctx context.Context) error {

	deletedTorrents := make([]*qbClient.TorrentInfo, 0)

	configuration.MustGetConfig(globals.Config)
	clients := qbClient.Registry().All()

	for _, client := range clients {
		torrents, errL := client.GetTorrents(ctx)

		if errL != nil {
			return errL
		}

		for _, torrent := range torrents {
			resp2, err2 := torrent.GetTracker(ctx, torrent.Hash)
			if err2 != nil {
				return err2
			}
			for _, v2 := range resp2 {
				if v2.Msg != "Torrent has been deleted." {
					continue
				}

				deletedTorrents = append(deletedTorrents, torrent)

			}
		}
	}

	handleOutputs.PrintTorrentInfo(globals.Output, deletedTorrents)

	return nil
}
