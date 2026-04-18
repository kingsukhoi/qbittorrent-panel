package main

import (
	"errors"
	"log/slog"
	"net/http"
	"os"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/routers"
)

func main() {
	configFile, exist := os.LookupEnv("CONFIG_FILE")
	if !exist {
		configFile = "./dev.yaml"
	}
	cfg := configuration.MustGetConfig(configFile)
	// init the clients before graphql

	if cfg.GetEnv() == configuration.EnvDev {
		slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelDebug,
		})))
	} else { // production
		slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelInfo,
		})))
	}

	qbClient.Registry()

	h := routers.NewGraphqlHandler()

	// Create Echo instance
	e := routers.NewEchoHandler(h)

	err := e.Start(cfg.Port)
	if err != nil {
		if !errors.Is(err, http.ErrServerClosed) {
			panic(err)
		}
	}
}
