package qbClient

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"net/http/cookiejar"
	"net/textproto"
	"net/url"
	"slices"
	"strings"

	"github.com/kingsukhoi/qbitorrent-panel/pkg/configuration"
)

var httpClient http.Client

func init() {
	jar, _ := cookiejar.New(nil)
	httpClient = http.Client{
		Jar: jar,
	}
}

type Client struct {
	BasePath *url.URL
}

// MarshalJSON customizes the JSON output to show only the base path string
func (c *Client) MarshalJSON() ([]byte, error) {
	if c.BasePath == nil {
		return json.Marshal(nil)
	}
	return json.Marshal(c.BasePath.String())
}

func Login(ctx context.Context, login configuration.QbLogin) (*Client, error) {
	baseUrl, err := url.Parse(login.BasePath)
	if err != nil {
		return nil, err
	}

	rtnMe := &Client{
		BasePath: baseUrl,
	}

	data := url.Values{}
	data.Set("username", login.Username)
	data.Set("password", login.Password)

	req, err := http.NewRequestWithContext(ctx, "POST", rtnMe.BasePath.JoinPath("/api/v2/auth/login").String(), strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	//req.Header.Set("Referer", rtnMe.BasePath.String()+"/")

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, errors.New(string(body))
	}

	return rtnMe, err
}

func (c *Client) GetTorrents(ctx context.Context) ([]*TorrentInfo, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", c.BasePath.String()+"/api/v2/torrents/info?sort=added_on", nil)
	if err != nil {
		return nil, err
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	body, _ := io.ReadAll(resp.Body)
	defer resp.Body.Close()

	var rtnMe []*TorrentInfo

	err = json.Unmarshal(body, &rtnMe)
	if err != nil {
		return nil, err
	}
	for _, v := range rtnMe {
		v.Client = c
	}

	return rtnMe, nil
}

var TorrentNotFoundError = errors.New("torrent not found")

func (c *Client) GetTorrent(ctx context.Context, infoHash string) (*TorrentInfo, error) {
	// api/v2/torrents/info?hashs={{hash}}

	data := url.Values{}
	data.Set("hashes", infoHash)

	currUrl := c.BasePath.JoinPath("/api/v2/torrents/info")
	currUrl.RawQuery = data.Encode()

	req, err := http.NewRequestWithContext(ctx, "GET", currUrl.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	body, _ := io.ReadAll(resp.Body)
	defer resp.Body.Close()

	var rtnMe []*TorrentInfo
	err = json.Unmarshal(body, &rtnMe)
	if err != nil {
		return nil, err
	}

	if len(rtnMe) != 1 {
		return nil, TorrentNotFoundError
	}

	return rtnMe[0], nil

}

// GetTracker retrieves the list of trackers for a specific torrent using its infohash.
// Returns a slice of TorrentTracker or an error.
func (c *Client) GetTracker(ctx context.Context, infohash string) ([]*TorrentTracker, error) {
	data := url.Values{}
	data.Set("hash", infohash)

	currUrl := c.BasePath.JoinPath("/api/v2/torrents/trackers")
	currUrl.RawQuery = data.Encode()

	req, err := http.NewRequestWithContext(ctx, "GET", currUrl.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var rtnMe []*TorrentTracker
	err = json.Unmarshal(body, &rtnMe)

	return rtnMe, nil
}

// GetCategories list all the categories in a given httpClient.
// Returns a map of categories where the key is the name of the category, and the value is Category
func (c *Client) GetCategories(ctx context.Context) (map[string]Category, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", c.BasePath.String()+"/api/v2/torrents/categories", nil)
	if err != nil {
		return nil, err
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var qbCategories map[string]Category

	err = json.Unmarshal(body, &qbCategories)
	if err != nil {
		return nil, err
	}
	return qbCategories, nil

}

// CreateCategoryIfNotExist Add the given category to the httpClient.
// If the category exists on the httpClient, it will be skipped
// https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#add-new-category
func (c *Client) CreateCategoryIfNotExist(ctx context.Context, category *Category) error {
	categoryInClient := slices.ContainsFunc(category.Servers, func(s string) bool {
		return c.BasePath.String() == s
	})
	if categoryInClient {
		return nil
	}

	categoryInClient = false

	data := url.Values{}
	data.Set("category", category.Name)
	data.Set("savePath", category.SavePath)

	slog.Debug("Category", "encoded", data.Encode())

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.BasePath.JoinPath("/api/v2/torrents/createCategory").String(),
		strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=utf-8")

	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 400 {
		return errors.New("category name is empty")
	} else if resp.StatusCode == 409 {
		return errors.New("category name is invalid")
	} else if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return errors.New(string(body))
	}

	return nil
}

func (c *Client) GetFilesInTorrent(ctx context.Context, InfoHashV1 string) ([]TorrentFile, error) {
	data := url.Values{}
	data.Set("hash", InfoHashV1)

	path := c.BasePath.JoinPath("/api/v2/torrents/files")
	path.RawQuery = data.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, path.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	body, _ := io.ReadAll(resp.Body)
	defer resp.Body.Close()
	var qbFiles []TorrentFile
	err = json.Unmarshal(body, &qbFiles)
	if err != nil {
		return nil, err
	}

	return qbFiles, nil
}

func (c *Client) PauseTorrents(ctx context.Context, hashes []string) error {

	hashesString := strings.Join(hashes, "|")

	data := url.Values{}
	data.Set("hashes", hashesString)

	path := c.BasePath.JoinPath("/api/v2/torrents/stop")

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, path.String(), strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")

	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return errors.New(string(body))
	}

	return nil
}

func (c *Client) ResumeTorrents(ctx context.Context, hashes []string) error {

	hashesString := strings.Join(hashes, "|")

	data := url.Values{}
	data.Set("hashes", hashesString)

	path := c.BasePath.JoinPath("/api/v2/torrents/start")

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, path.String(), strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")

	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return errors.New(string(body))
	}

	return nil
}

// UploadTorrentFiles https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)#add-new-torrent
func (c *Client) UploadTorrentFiles(ctx context.Context, files []UploadTorrentInfo, category string) (*TorrentInfo, error) {

	var b bytes.Buffer
	multipartWriter := multipart.NewWriter(&b)

	for _, currFile := range files {
		fileHeader := make(textproto.MIMEHeader)
		fileHeader.Set("Content-Disposition", fmt.Sprintf(`form-data; name="torrents"; filename="%s"`,
			currFile.Filename))
		fileHeader.Set("Content-Type", "application/x-bittorrent")

		filePart, err := multipartWriter.CreatePart(fileHeader)
		if err != nil {
			return nil, err
		}
		_, err = io.Copy(filePart, currFile.File)
		if err != nil {
			return nil, err
		}
	}

	categoryHeader := make(textproto.MIMEHeader)
	categoryHeader.Set("Content-Disposition", fmt.Sprintf(`form-data; name="category"`))

	if category != "" {
		categoryWriter, err := multipartWriter.CreatePart(categoryHeader)
		if err != nil {
			return nil, err
		}
		_, err = categoryWriter.Write([]byte(category))
		if err != nil {
			return nil, err
		}
	}

	autoTmmHeader := make(textproto.MIMEHeader)
	autoTmmHeader.Set("Content-Disposition", fmt.Sprintf(`form-data; name="autoTMM"`))
	autoTmmWriter, err := multipartWriter.CreatePart(autoTmmHeader)
	if err != nil {
		return nil, err
	}
	_, err = autoTmmWriter.Write([]byte("true"))

	multipartWriter.Close()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		c.BasePath.JoinPath("/api/v2/torrents/add").String(), &b)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 415 {
		return nil, errors.New("torrent file is invalid")
	} else if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, errors.New(string(body))
	}

	return nil, nil

}

func (c *Client) GetVersion(ctx context.Context) (string, error) {
	//https://{{hostname}}/api/v2/app/webapiVersion

	currPath := c.BasePath.JoinPath("/api/v2/app/webapiVersion")

	req, err := http.NewRequestWithContext(ctx, "GET", currPath.String(), nil)
	if err != nil {
		return "", err
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return string(body), nil
}
