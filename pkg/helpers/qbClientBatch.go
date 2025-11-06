package helpers

import (
	"context"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
)

func GetAllCategories(ctx context.Context) (map[string]*qbClient.Category, error) {

	categories := make(map[string]*qbClient.Category)

	clients := qbClient.Registry().All()

	for _, client := range clients {
		c, err2 := client.GetCategories(ctx)
		if err2 != nil {
			return nil, err2
		}

		for _, v := range c {
			curr, exist := categories[v.Name]
			if !exist {
				categories[v.Name] = &qbClient.Category{
					Name:     v.Name,
					SavePath: v.SavePath,
					Servers:  nil,
				}
				curr = categories[v.Name]
			}
			curr.Servers = append(curr.Servers, client.BasePath.String())
		}
	}

	return categories, nil
}
