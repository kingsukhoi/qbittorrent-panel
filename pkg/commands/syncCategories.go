package commands

import (
	"context"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/helpers"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
)

type SyncCategoriesCmd struct{}

func (s *SyncCategoriesCmd) Run(globals *Globals, ctx context.Context) error {
	configuration.MustGetConfig(globals.Config)
	clients := qbClient.Registry().All()

	categories, err := helpers.GetAllCategories(ctx)
	if err != nil {
		return err
	}

	for _, client := range clients {
		for _, v := range categories {
			err2 := client.SyncCategories(ctx, v)
			if err2 != nil {
				return err2
			}
		}
	}

	return nil
}
