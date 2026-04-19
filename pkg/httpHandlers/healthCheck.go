package httpHandlers

import (
	"net/http"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
	"github.com/labstack/echo/v5"
)

func HealthCheck(c *echo.Context) error {
	clients := qbClient.Registry().All()

	if len(clients) == 0 {
		return echo.NewHTTPError(http.StatusServiceUnavailable, "no qbClient found")
	}

	for _, client := range clients {
		_, err := client.GetVersion(c.Request().Context())
		if err != nil {
			return err
		}
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status": "ok",
	})
}
