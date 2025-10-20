package main

import (
	"fmt"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/config"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
)

func main() {
	config.MustGetConfig("./dev.yaml")
	clients, err := qbClient.GetClients()
	if err != nil {
		panic(err)
	}

	for _, client := range clients {
		torrents, errL := client.GetTorrents()

		if errL != nil {
			panic(err)
		}

		for _, torrent := range torrents {
			resp2, err2 := client.GetTracker(torrent.Hash)
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
}
