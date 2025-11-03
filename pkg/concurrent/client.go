package concurrent

import (
	"context"
	"sync"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
)

type listTorrentResp struct {
	torrents []*qbClient.TorrentInfo
	err      error
}

func ListTorrents(ctx context.Context, clients []*qbClient.Client) ([]*qbClient.TorrentInfo, []error) {
	wg := &sync.WaitGroup{}
	responseChannel := make(chan listTorrentResp)

	for _, client := range clients {
		wg.Add(1)
		go func(ctx context.Context, wg *sync.WaitGroup, c *qbClient.Client) {
			defer wg.Done()
			resp, err := client.GetTorrents(ctx)
			responseChannel <- listTorrentResp{
				torrents: resp,
				err:      err,
			}
		}(ctx, wg, client)
	}
	go func() {
		wg.Wait()
		close(responseChannel)
	}()

	rtnMe := make([]*qbClient.TorrentInfo, 0)
	errors := make([]error, 0)
	for resp := range responseChannel {
		if resp.err != nil {
			errors = append(errors, resp.err)
			continue
		}
		rtnMe = append(rtnMe, resp.torrents...)
	}
	return rtnMe, errors
}
