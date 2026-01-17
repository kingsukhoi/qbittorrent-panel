package routers

import (
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/httpHandlers"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewEchoHandler(gqlHandler *handler.Server) *echo.Echo {

	e := echo.New()

	middleware.RequestLogger()

	// Middleware
	e.Use(middleware.RequestLogger())
	e.Use(middleware.Recover())

	// GraphQL endpoint
	e.POST("/query", echo.WrapHandler(gqlHandler))

	// GraphQL playground
	e.GET("/", echo.WrapHandler(playground.Handler("GraphQL Playground", "/query")))

	// Health check endpoint
	e.GET("/health", httpHandlers.HealthCheck)

	e.POST("/uploadTorrent", httpHandlers.TorrentUpload)

	return e
}
