package main

import (
	"github.com/alecthomas/kong"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/commands"
)

func main() {
	ctx := kong.Parse(&commands.CLI,
		kong.Bind(&commands.CLI.Globals),
		kong.Name("qbittorrent-panel"),
		kong.Description("A CLI tool to manage qBittorrent instances"),
		kong.UsageOnError(),
	)

	err := ctx.Run()
	ctx.FatalIfErrorf(err)
}
