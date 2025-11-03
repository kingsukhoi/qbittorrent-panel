package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/alecthomas/kong"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/commands"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	kongCtx := kong.Parse(&commands.CLI,
		kong.Bind(&commands.CLI.Globals),
		kong.BindTo(ctx, (*context.Context)(nil)),
		kong.Name("qbittorrent-panel"),
		kong.Description("A CLI tool to manage qBittorrent instances"),
		kong.UsageOnError(),
	)

	err := kongCtx.Run()
	kongCtx.FatalIfErrorf(err)
}
