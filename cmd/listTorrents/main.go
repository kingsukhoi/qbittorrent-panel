package main

import (
	"fmt"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/config"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
	"slices"
	"strings"
)

func main() {

	config.MustGetConfig("./dev.yaml")

	clients, err := qbClient.GetClients()
	if err != nil {
		panic(err)
	}

	torrents := make([]*qbClient.TorrentInfo, 0)

	for _, client := range clients {
		resp, err2 := client.GetTorrents()
		if err2 != nil {
			panic(err2)
		}
		torrents = append(torrents, resp...)
	}

	slices.SortFunc(torrents, func(a *qbClient.TorrentInfo, b *qbClient.TorrentInfo) int {
		return strings.Compare(a.Name, b.Name)
	})

	fmt.Println("Name,Url")
	for _, torrent := range torrents {
		fmt.Printf("%s,%s\n", torrent.Name, torrent.QbInstance)
	}

}
