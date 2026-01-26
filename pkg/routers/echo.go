package routers

import (
	"errors"
	"io/fs"
	"log/slog"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/httpHandlers"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewEchoHandler(gqlHandler *handler.Server) *echo.Echo {

	e := echo.New()

	e.HideBanner = true

	// Middleware
	e.Use(middleware.RequestLogger())
	e.Use(middleware.Recover())

	// GraphQL endpoint
	e.POST("/query", echo.WrapHandler(gqlHandler))

	// GraphQL playground
	e.GET("/playground", echo.WrapHandler(playground.Handler("GraphQL Playground", "/query")))

	// Health check endpoint
	e.GET("/health", httpHandlers.HealthCheck)

	e.POST("/uploadTorrent", httpHandlers.TorrentUpload)

	config := configuration.MustGetConfig()

	fePathExists, err := pathExist(config.FrontEndPath)
	if err != nil {
		slog.Error("Error checking frontend path", "path", config.FrontEndPath, "error", err)
		fePathExists = false
	}

	if fePathExists {
		e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
			Root:  config.FrontEndPath,
			Index: "index.html",
			HTML5: true,
		}))
	} else {
		e.GET("/", echo.WrapHandler(playground.Handler("GraphQL Playground", "/query")))
	}

	return e
}

func pathExist(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil {
		return true, nil
	}
	if errors.Is(err, fs.ErrNotExist) {
		return false, nil
	}
	return false, err
}
