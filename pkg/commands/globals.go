package commands

type Globals struct {
	Config string `help:"Path to configuration file" default:"./dev.yaml" short:"c" type:"path"`
}

var CLI struct {
	Globals

	Deleted        DeletedCmd        `cmd:"" help:"List torrents that have been deleted from tracker"`
	List           ListCmd           `cmd:"" help:"List all torrents sorted by name"`
	SyncCategories SyncCategoriesCmd `cmd:"" help:"Sync categories across all qBittorrent clients"`
}
