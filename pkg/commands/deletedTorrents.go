package commands

import (
	"context"
	"fmt"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
)

type DeletedCmd struct{}

func (d *DeletedCmd) Run(globals *Globals, ctx context.Context) error {

	configuration.MustGetConfig(globals.Config)
	clients, err := qbClient.GetClients(ctx)
	if err != nil {
		return err
	}

	for _, client := range clients {
		torrents, errL := client.GetTorrents(ctx)

		if errL != nil {
			panic(err)
		}

		for _, torrent := range torrents {
			resp2, err2 := torrent.GetTracker(ctx, torrent.Hash)
			if err2 != nil {
				panic(err2)
			}
			for _, v2 := range resp2 {
				//if v2.Msg == "This torrent is private" || v2.Msg == "" {
				//	continue
				//}

				if v2.Msg != "Torrent has been deleted." {
					continue
				}

				fmt.Printf("%s - %s - %s - %s\n", torrent.Name, v2.Url, v2.Msg, client.BasePath.String())

			}
		}
	}

	return nil
}
