package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"time"

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

	if cfg.GetEnv() == configuration.EnvDev {
		e.Debug = true
	}

	// Root context is cancelled on Ctrl+C / SIGINT
	rootCtx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	// Start server
	go func() {
		err := e.Start(cfg.Port)
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			e.Logger.Fatal("shutting down the server")
		}
	}()

	// start qbittorrent client keep alive (stops on shutdown)
	go func(ctx context.Context) {
		ticker := time.NewTicker(30 * time.Minute)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				clients := qbClient.Registry().All()
				for _, client := range clients {
					reqCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
					_, err := client.GetVersion(reqCtx)
					cancel()

					if err != nil {
						slog.Error("qbittorrent keep-alive failed", "basePath", client.BasePath.String(), "err", err)
					}
				}
			}
		}
	}(rootCtx)

	// Wait for interrupt signal
	<-rootCtx.Done()

	// Graceful shutdown with timeout
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(shutdownCtx); err != nil {
		e.Logger.Fatal(err)
	}
}
