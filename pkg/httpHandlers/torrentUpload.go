package httpHandlers

import (
	"mime/multipart"
	"net/http"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/helpers"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/qbClient"
	"github.com/labstack/echo/v4"
)

func TorrentUpload(c echo.Context) error {
	ctx := c.Request().Context()

	category := c.FormValue("category")

	form, err := c.MultipartForm()
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	files := form.File["torrents"]

	uploadMe := make([]qbClient.UploadTorrentInfo, 0)
	openFiles := make([]multipart.File, 0)

	defer func() {
		for _, f := range openFiles {
			_ = f.Close()
		}
	}()

	for _, formFile := range files {
		file, errL := formFile.Open()
		if errL != nil {
			return echo.NewHTTPError(http.StatusBadRequest, errL.Error())
		}

		openFiles = append(openFiles, file)

		qbFile := qbClient.UploadTorrentInfo{}

		qbFile.File = file
		qbFile.Filename = formFile.Filename
		uploadMe = append(uploadMe, qbFile)
	}

	categories, err := helpers.GetAllCategories(ctx)
	if err != nil {
		return err
	}

	qbCategory, exist := categories[category]
	if !exist {
		return echo.NewHTTPError(http.StatusNotFound, "Category not found")
	}

	server := qbCategory.Servers[0]

	client, _ := qbClient.Registry().Get(server)

	_, err = client.UploadTorrentFiles(ctx, uploadMe, qbCategory.Name)
	if err != nil {
		return err
	}

	return nil
}
