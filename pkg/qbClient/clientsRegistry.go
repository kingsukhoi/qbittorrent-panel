package qbClient

import (
	"context"
	"log/slog"
	"sync"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
)

type ClientRegistry struct {
	clients map[string]*Client
}

func (r *ClientRegistry) Get(basePath string) (*Client, bool) {
	curr, ok := r.clients[basePath]
	return curr, ok
}

func (r *ClientRegistry) All() []*Client {
	result := make([]*Client, 0, len(r.clients))
	for _, client := range r.clients {
		result = append(result, client)
	}
	return result
}

var Registry = sync.OnceValue(func() *ClientRegistry {
	cfg := configuration.MustGetConfig()
	clients := make(map[string]*Client)

	for _, v := range cfg.Endpoints {
		currClient, err := Login(context.Background(), configuration.QbLogin{
			BasePath: v.BasePath,
			Username: v.Username,
			Password: v.Password,
		})
		if err != nil {
			slog.Error("Failed to connect to client", "hostname", v.BasePath)
			continue
		}
		clients[currClient.BasePath.String()] = currClient
	}

	return &ClientRegistry{clients: clients}
})
