package handleOutputs

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/jedib0t/go-pretty/v6/table"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
)

func PrintTorrentInfo(outputType string, torrentInfo []*qbClient.TorrentInfo) {

	switch outputType {
	case "json":
		printJson(torrentInfo)
	default:
		printTable(outputType, torrentInfo)
	}

}

func printJson(input []*qbClient.TorrentInfo) {

	output, _ := json.MarshalIndent(input, "", "  ")
	fmt.Println(string(output))

}

func printTable(outputType string, input []*qbClient.TorrentInfo) {
	t := table.NewWriter()
	t.SetOutputMirror(os.Stdout)
	t.AppendHeader(table.Row{"Name", "Host", "Category", "Ratio", "Path"})

	t.SortBy([]table.SortBy{
		{Name: "Host", Mode: table.Asc},
		{Name: "Name", Mode: table.Asc},
	})

	lastHost := input[0].Client.BasePath

	for _, i := range input {
		if lastHost != i.Client.BasePath {
			t.AppendSeparator()
			lastHost = i.Client.BasePath
		}
		t.AppendRow(table.Row{
			i.Name,
			i.Client.BasePath,
			i.Category,
			fmt.Sprintf("%.2f", i.Ratio),
			i.ContentPath,
		})

	}

	switch outputType {
	default:
		t.Render()
	case "csv":
		t.RenderCSV()
	case "tsv":
		t.RenderTSV()
	case "markdown":
		t.RenderMarkdown()

	}

}
