package main

import (
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/gqlGenerated"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/gqlResolvers"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/httpHandlers"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	cfg := configuration.MustGetConfig("./dev.yaml")
	// init the clients before graphql
	qbClient.Registry()

	// Create Echo instance
	e := echo.New()

	// Middleware
	e.Use(middleware.RequestLogger())
	e.Use(middleware.Recover())

	// Create resolver
	resolver := &gqlResolvers.Resolver{}

	// Create GraphQL server
	h := handler.New(gqlGenerated.NewExecutableSchema(gqlGenerated.Config{
		Resolvers: resolver,
	}))

	h.AddTransport(transport.Options{})
	h.AddTransport(transport.GET{})
	h.AddTransport(transport.POST{})

	h.Use(extension.Introspection{})

	// GraphQL endpoint
	e.POST("/query", echo.WrapHandler(h))

	// GraphQL playground
	e.GET("/", echo.WrapHandler(playground.Handler("GraphQL Playground", "/query")))

	// Health check endpoint
	e.GET("/health", func(c echo.Context) error {

		return c.JSON(http.StatusOK, map[string]string{
			"status": "ok",
		})
	})

	e.POST("/uploadTorrent", httpHandlers.TorrentUpload)

	// Start server
	e.Logger.Fatal(e.Start(cfg.Port))
}
