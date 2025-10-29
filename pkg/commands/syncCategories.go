package commands

import (
	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
)

type SyncCategoriesCmd struct{}

func (s *SyncCategoriesCmd) Run(globals *Globals) error {
	configuration.MustGetConfig(globals.Config)
	clients, err := qbClient.GetClients()
	if err != nil {
		return err
	}

	categories := make(map[string]*qbClient.Category)

	for _, client := range clients {
		c, err2 := client.GetCategories()
		if err2 != nil {
			return err2
		}

		for _, v := range c {
			curr, exist := categories[v.Name]
			if !exist {
				categories[v.Name] = &qbClient.Category{
					Name:       v.Name,
					SavePath:   v.SavePath,
					ClientUrls: nil,
				}
				curr = categories[v.Name]
			}
			curr.ClientUrls = append(curr.ClientUrls, client.BasePath.String())
		}
	}

	for _, client := range clients {
		for _, v := range categories {
			err2 := client.SyncCategories(v)
			if err2 != nil {
				return err2
			}
		}
	}

	return nil
}
