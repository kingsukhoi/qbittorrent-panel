package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/routers"
)

func main() {
	cfg := configuration.MustGetConfig("./dev.yaml")
	// init the clients before graphql
	qbClient.Registry()

	h := routers.NewGraphqlHandler()

	// Create Echo instance
	e := routers.NewEchoHandler(h)

	// Start server
	go func() {
		err := e.Start(cfg.Port)
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			e.Logger.Fatal("shutting down the server")
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with a timeout of 10 seconds.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal(err)
	}
}
