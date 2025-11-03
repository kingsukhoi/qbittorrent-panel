package main

import (
	"context"
	"fmt"
	"os"
	"slices"
	"strings"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/concurrent"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
)

func main() {
	ctx := context.Background()
	configuration.MustGetConfig("./dev.yaml")

	clients, err := qbClient.GetClients(ctx)
	if err != nil {
		panic(err)
	}

	torrents, errA := concurrent.ListTorrents(ctx, clients)

	slices.SortFunc(torrents, func(a *qbClient.TorrentInfo, b *qbClient.TorrentInfo) int {
		return strings.Compare(a.Name, b.Name)
	})

	fmt.Println("Name,Url")
	for _, torrent := range torrents {
		fmt.Printf("%s,%s\n", torrent.Name, torrent.Client.BasePath.String())
	}
	success := true
	for _, errL := range errA {
		success = false
		print(errL)
	}
	if !success {
		os.Exit(1)
	}
}
