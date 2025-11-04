package commands

type Globals struct {
	Config string `help:"Path to configuration file" default:"./dev.yaml" short:"c" type:"path"`
	Output string `help:"Output format. Ex. table (default), json, csv, tsv, markdown" short:"o" default:"table" enum:"table,json,csv,tsv,markdown"`
}

var CLI struct {
	Globals

	Abandoned      ListAbandonedTorrents `cmd:"" help:"List torrents that have been deleted from tracker"`
	List           ListCmd               `cmd:"" help:"List all torrents sorted by name"`
	SyncCategories SyncCategoriesCmd     `cmd:"" help:"Sync categories across all qBittorrent clients"`
}
