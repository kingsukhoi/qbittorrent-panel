package commands

import (
	"context"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/handleOutputs"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
)

type ListCmd struct{}

func (l *ListCmd) Run(globals *Globals, ctx context.Context) error {
	configuration.MustGetConfig(globals.Config)

	clients := qbClient.Registry().All()

	torrents := make([]*qbClient.TorrentInfo, 0)

	for _, client := range clients {
		resp, err2 := client.GetTorrents(ctx)
		if err2 != nil {
			return err2
		}
		torrents = append(torrents, resp...)
	}

	handleOutputs.PrintTorrentInfo(globals.Output, torrents)

	return nil
}
