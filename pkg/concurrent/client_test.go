package concurrent

import (
	"testing"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
)

func TestGetTorrents(t *testing.T) {
	_ = configuration.MustGetConfig("./dev.yaml")

	clients, err := qbClient.GetClients()
	if err != nil {
		t.Fatal(err)
	}

	torrents, errA := ListTorrents(clients)
	if len(errA) > 0 {
		t.Fatal(errA)
	}

	if len(torrents) == 0 {
		t.Fatal("no torrents found")
	}

}
