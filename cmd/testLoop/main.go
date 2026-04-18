package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/database"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbDbSyncer"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/sqlc"
)

func main() {
	configFile, exist := os.LookupEnv("CONFIG_FILE")
	if !exist {
		configFile = "./dev.yaml"
	}
	_ = configuration.MustGetConfig(configFile)
	// init the clients before graphql

	db := database.MustGet()
	queries := sqlc.New(db)

	go qbDbSyncer.SyncDbLoop(context.Background())

	for {
		torrents, err := queries.GetTorrents(context.Background())
		if err != nil {
			panic(err)
		}
		jsonString, err := json.MarshalIndent(torrents, "", "  ")
		if err != nil {
			panic(err)
		}
		fmt.Println(string(jsonString))

		time.Sleep(3 * time.Second)
	}
}
